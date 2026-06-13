/**
 * lesson-craft Web Components
 *
 * Copy to assets/lesson-components.js and include in every lesson:
 *   <link rel="stylesheet" href="../assets/lesson.css">
 *   <script defer src="../assets/lesson-components.js"></script>
 */

// ─── Safe registration ───────────────────────────────────
function define(tag, ctor) {
  if (!customElements.get(tag)) customElements.define(tag, ctor);
}

// ─── View transition debug logging ───────────────────────
function logViewTransitionDebug(eventName, detail = {}) {
  if (localStorage.getItem('lessonVtDebug') !== '1') return;
  const payload = {
    page: location.pathname,
    time: new Date().toISOString(),
    supportsStartViewTransition: 'startViewTransition' in document,
    supportsPageReveal: 'onpagereveal' in window,
    supportsNavigationActivation: Boolean(window.navigation?.activation),
    reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    ...detail,
  };
  console.log(`[lesson-vt] ${eventName}`, payload);
}

function installViewTransitionDebug() {
  logViewTransitionDebug('script-loaded', {
    referrer: document.referrer || '(none)',
    navigationType: performance.getEntriesByType('navigation')[0]?.type ?? '(unknown)',
  });

  document.addEventListener('click', (event) => {
    const anchor = event.target.closest('a');
    if (!anchor) return;
    logViewTransitionDebug('link-click', {
      href: anchor.href,
      text: anchor.textContent.trim(),
      sameOrigin: new URL(anchor.href, location.href).origin === location.origin,
    });
  }, { capture: true });

  window.addEventListener('pageshow', (event) => {
    logViewTransitionDebug('pageshow', { persisted: event.persisted });
  });

  window.addEventListener('pagehide', (event) => {
    logViewTransitionDebug('pagehide', { persisted: event.persisted });
  });

  window.addEventListener('pagereveal', (event) => {
    logViewTransitionDebug('pagereveal', {
      hasViewTransition: Boolean(event.viewTransition),
      fromUrl: window.navigation?.activation?.from?.url ?? '(none)',
      entryUrl: window.navigation?.activation?.entry?.url ?? '(none)',
    });

    if (!event.viewTransition) return;
    event.viewTransition.ready
      .then(() => logViewTransitionDebug('transition-ready'))
      .catch((error) => logViewTransitionDebug('transition-ready-error', { message: error.message }));
    event.viewTransition.finished
      .then(() => logViewTransitionDebug('transition-finished'))
      .catch((error) => logViewTransitionDebug('transition-finished-error', { message: error.message }));
  });
}

installViewTransitionDebug();

// ─── Local progress tracking ──────────────────────────────
function installCourseProgress() {
  const lessonMatch = location.pathname.match(/\/lessons\/(\d{4})-/);
  if (lessonMatch) {
    localStorage.setItem(`multiplexing.lesson.${lessonMatch[1]}`, 'complete');
  }

  const progressEl = document.getElementById('course-progress');
  if (!progressEl) return;

  const total = 8;
  const completed = Array.from({ length: total }, (_, index) => String(index + 1).padStart(4, '0'))
    .filter((id) => localStorage.getItem(`multiplexing.lesson.${id}`) === 'complete')
    .length;
  progressEl.textContent = `${completed} of ${total} lessons completed`;
  progressEl.setAttribute('aria-label', `Course progress: ${completed} of ${total} lessons completed`);
}

installCourseProgress();

// ─── <lesson-header> ─────────────────────────────────────
define('lesson-header', class extends HTMLElement {
  connectedCallback() {
    const slot = this.querySelector(':scope > [slot]') ?? this.firstElementChild;
    if (slot) this.replaceWith(slot);
  }
});

// ─── <lesson-nav> ────────────────────────────────────────
define('lesson-nav', class extends HTMLElement {
  connectedCallback() {
    const prev = this.getAttribute('previous');
    const next = this.getAttribute('next');
    const home = this.getAttribute('home');
    this.innerHTML = `
      <nav class="lesson-nav" aria-label="Lesson navigation">
        ${home ? `<a href="${home}" class="nav-home" rel="home">🏠 Course Home</a>` : ''}
        ${home ? `<a href="${home.replace('index.html', 'reference/cheatsheet.html')}" class="nav-cheatsheet">📌 Cheat Sheet</a>` : ''}
        <span class="nav-prev-next">
          ${prev ? `<a href="${prev}" class="nav-prev" rel="prev">← Previous</a>` : ''}
          ${next ? `<a href="${next}" class="nav-next" rel="next">Next →</a>` : ''}
        </span>
      </nav>
    `;
  }
});

// ─── <knowledge-check> ───────────────────────────────────
define('knowledge-check', class extends HTMLElement {
  connectedCallback() {
    if (this.dataset.ready === 'true') return;
    queueMicrotask(() => this.render());
  }

  render() {
    if (this.dataset.ready === 'true') return;
    const correct = this.getAttribute('correct');
    const cf = this.getAttribute('correct-feedback') || 'Correct!';
    const inf = this.getAttribute('incorrect-feedback') || 'Not quite.';
    const ef = this.getAttribute('empty-feedback') || 'Select an option first.';

    const form = this.querySelector('form');
    if (!form) return;
    this.dataset.ready = 'true';

    const btn = document.createElement('button');
    btn.type = 'submit';
    btn.textContent = this.getAttribute('button-label') || 'Check';
    form.appendChild(btn);

    const feedback = document.createElement('p');
    feedback.className = 'knowledge-feedback';
    feedback.setAttribute('aria-live', 'polite');
    form.appendChild(feedback);

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const checked = form.querySelector('input[type="radio"]:checked');
      if (!checked) { feedback.textContent = ef; return; }
      if (checked.value === correct) {
        feedback.textContent = checked.dataset.feedback || cf;
        return;
      }
      feedback.textContent = checked.dataset.feedback || inf;
    });
  }
});

// ─── <source-code> ───────────────────────────────────────
// Fetches source file via HTTP. On file://, shows instructions.
define('source-code', class extends HTMLElement {
  async connectedCallback() {
    const src = this.getAttribute('src');
    const label = this.getAttribute('label') || src;
    const figure = document.createElement('figure');
    figure.className = 'source-code';
    figure.innerHTML = `<figcaption>${label}</figcaption><pre><code>Loading source...</code></pre>`;
    this.append(figure);

    if (!src) return;
    try {
      const res = await fetch(src);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      figure.querySelector('code').textContent = text;
    } catch {
      figure.querySelector('code').textContent =
        `[Open ${src} to view source — file:// fetches not supported by browser policy]`;
    }
  }
});
