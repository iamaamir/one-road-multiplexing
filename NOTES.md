# Notes

## Learner profile

- Beginner.
- Wants full intuition: explain to a six-year-old, recognize problem fit, then build practical real-world use case.
- Scope includes networking, OS I/O, HTTP/2, TCP, async event loops, media streams.

## Teaching approach

Use “many labeled conversations sharing one road” framing first. Delay protocol-specific complexity until learner can predict multiplex/demux behavior from labels, sequence numbers, and chunks.

## Handoff

First agent/model created mission and lesson 0001. Lesson 2 covers head-of-line blocking and fair scheduling with greedy vs fair scheduler demo. Lesson 3 covers OS/network demultiplexing by protocol, IP, and port with ports/sockets. Lesson 4 covers I/O multiplexing: one thread watching many sockets by readiness instead of blocking on one. Lessons 5-8 were batch-generated after explicit user approval: event loop queues, HTTP/2 streams/frames, media timestamp multiplexing/jitter buffers, and a final mini multiplexed chat protocol. Course now has an end-to-end beginner arc from toy-road intuition to practical app-channel protocol.

Polish/review pass added a cheat sheet and final WebSocket project. Final project is dependency-free: `project/mini-ws-server.mjs` plus `project/mini-ws-chat.html`, using the tested mini multiplexed chat frame protocol. Capstone worksheet intentionally deferred per user request.

If continuing, next work should be browser manual QA and visual polish only: click all lessons, run all demos, answer every knowledge check wrong/right, and test the WebSocket project in two browser windows.

## UI implementation notes

- Cross-document View Transitions are enabled in `assets/lesson.css` with `@view-transition { navigation: auto; }`.
- Pages use `<link rel="expect" href="#page-ready" blocking="render">` so destination header is parsed before transition snapshot.
- Do not use named `view-transition-name` on nearly identical lesson shells by default. It can make transitions fire but look invisible.
- If transitions seem inconsistent, inspect console logs from `assets/lesson-components.js`. If `transition-ready` and `transition-finished` fire, API works; fix animation visibility instead of navigation wiring.
