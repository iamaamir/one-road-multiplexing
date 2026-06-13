# View transition debugging

## Evidence
Learner noticed cross-page transitions were inconsistent even after the course had View Transition CSS. Console logs showed `pagereveal`, `transition-ready`, and `transition-finished` fired on every navigation.

## Challenges
The bug was not missing API support or failed navigation. The named `page-shell` transition animated nearly identical `<main>` boxes, so the transition visually appeared absent on some lesson-to-lesson paths.

## Engagement Pattern
Learner tested real navigation paths, reported precise behavior, and pasted diagnostic logs. This makes browser-event instrumentation useful for future UI debugging.

## Adjust
For course pages, prefer a visible root transition over named shell morphs unless elements are visually distinct. When View Transitions feel inconsistent, log `pagereveal`, `transition-ready`, and `transition-finished` before changing CSS. If promises fire, debug animation visibility, not API triggering.
