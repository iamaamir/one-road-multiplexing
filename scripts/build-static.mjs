#!/usr/bin/env node
import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { existsSync, globSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { execSync } from 'node:child_process';

const ROOT = new URL('..', import.meta.url).pathname;
const DIST = join(ROOT, 'docs');

const INCLUDES = [
  'lessons', 'assets', 'reference', 'project', 'src',
  'index.html', '.nojekyll', '404.html',
];

// Files stored in assets/ that must be served from site root
const ROOT_ASSETS = ['robots.txt', 'sitemap.xml', 'llms.txt'];

// Derived image assets generated from assets/logo.png
const DERIVED_IMAGES = [
  { name: 'favicon-32.png', size: 32 },
  { name: 'favicon-192.png', size: 192 },
  { name: 'og-image.png', width: 1200, height: 630 },
];

function hasSips() {
  try { execSync('which sips', { stdio: 'ignore' }); return true; }
  catch { return false; }
}

async function generateFavicons() {
  const logo = join(ROOT, 'assets', 'logo.png');
  if (!existsSync(logo)) return;
  if (!hasSips()) { console.warn('  ⚠  sips not found, skipping favicon generation'); return; }

  for (const img of DERIVED_IMAGES) {
    const out = join(ROOT, 'assets', img.name);
    if (img.width) {
      execSync(`sips --cropToHeightWidth ${img.height} ${img.width} "${logo}" --out "${out}" 2>/dev/null`);
    } else {
      execSync(`sips -Z ${img.size} "${logo}" --out "${out}" 2>/dev/null`);
    }
  }
}

// Load minifiers with graceful fallback
let minifyCSS, minifyJS, minifyHTML;

try {
  const { transform } = await import('lightningcss');
  minifyCSS = (code) => transform({ code: Buffer.from(code), minify: true, sourceMap: false }).code.toString();
  console.log('  CSS minifier: lightningcss');
} catch { minifyCSS = (code) => { console.warn('  ⚠  lightningcss not found, skipping CSS minification'); return code; }; }

try {
  const terser = await import('terser');
  minifyJS = async (code) => (await terser.minify(code, { sourceMap: false, module: true })).code || code;
  console.log('  JS minifier: terser');
} catch { minifyJS = async (code) => { console.warn('  ⚠  terser not found, skipping JS minification'); return code; }; }

try {
  const { minify: htmlMin } = await import('html-minifier-terser');
  minifyHTML = async (html) => await htmlMin(html, {
    collapseWhitespace: true,
    conservativeCollapse: true,
    removeComments: true,
    minifyCSS: true,
    minifyJS: true,
    keepClosingSlash: true,
    caseSensitive: true,
    collapseBooleanAttributes: true,
    removeRedundantAttributes: false,
    removeEmptyAttributes: false,
    decodeEntities: false,
  });
  console.log('  HTML minifier: html-minifier-terser');
} catch { minifyHTML = async (html) => { console.warn('  ⚠  html-minifier-terser not found, skipping HTML minification'); return html; }; }

function globFiles(dir, pattern) {
  return globSync(pattern, { cwd: dir, nodir: true }).map(f => join(dir, f));
}

async function minifyFiles(files, label, minifyFn, isAsync = false) {
  let saved = 0;
  for (const file of files) {
    try {
      const original = await readFile(file);
      const minified = isAsync ? await minifyFn(original.toString()) : minifyFn(original.toString());
      if (typeof minified === 'string' && minified.length < original.length) {
        saved += original.length - minified.length;
        await writeFile(file, minified);
      }
    } catch (err) {
      console.warn(`  ⚠  ${label} skip ${file.replace(DIST, '')}: ${err.message}`);
    }
  }
  if (saved > 0) console.log(`  ${label} saved ${(saved / 1024).toFixed(1)} KB across ${files.length} files`);
}

async function build() {
  console.log('Generating favicons from logo...');
  await generateFavicons();

  if (existsSync(DIST)) await rm(DIST, { recursive: true });
  await mkdir(DIST, { recursive: true });

  for (const item of INCLUDES) {
    const src = join(ROOT, item);
    if (!existsSync(src)) continue;
    await cp(src, join(DIST, item), { recursive: true });
  }

  // Copy root-level SEO files from assets/ to docs/ root
  for (const file of ROOT_ASSETS) {
    const src = join(ROOT, 'assets', file);
    if (!existsSync(src)) continue;
    await cp(src, join(DIST, file));
  }

  await writeFile(join(DIST, '.nojekyll'), '');

  console.log('Minifying...');

  const htmlFiles = globFiles(DIST, '**/*.html');
  const cssFiles = globFiles(DIST, '**/*.css');
  const jsFiles = globFiles(DIST, '**/*.{js,mjs}').filter(f => !f.includes('/src/'));

  await minifyFiles(htmlFiles, 'HTML', minifyHTML, true);
  await minifyFiles(cssFiles, 'CSS', minifyCSS, false);
  await minifyFiles(jsFiles, 'JS', minifyJS, true);

  const totalBytes = globFiles(DIST, '**/*')
    .reduce((sum, f) => sum + (existsSync(f) ? statSync(f).size : 0), 0);

  console.log(`\nBuilt to ${DIST} (${(totalBytes / 1024).toFixed(0)} KB)`);
  console.log('Deploy docs/ to GitHub Pages or any static host.');
}

build().catch(console.error);
