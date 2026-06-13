# Mission: Multiplexing

## Why
Learn multiplexing and demultiplexing deeply enough to explain them to a six-year-old, recognize real-world problems they solve, and build a practical system that uses one shared connection for many logical conversations.

## Success looks like
- Explain multiplexing as “many labeled streams sharing one road” and demultiplexing as “sorting arrivals by label.”
- Recognize when many separate connections/resources are wasteful or blocked by head-of-line waiting.
- Describe examples across networking, OS I/O, HTTP/2, TCP ports, async event loops, and media streams.
- Build a small practical app that carries multiple logical channels over one transport.

## Constraints
- Beginner-friendly sequence.
- Lessons must use interactive demos and runnable exercises.
- Prefer zero-infrastructure browser pages plus small Node tests when useful.

## Out of scope
- Deep math or formal queueing theory before intuition is solid.
- Production-grade protocol security until base mechanism is understood.
