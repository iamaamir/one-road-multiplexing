# Multiplexing Resources

## Official / primary sources

- RFC 9113 — HTTP/2: https://www.rfc-editor.org/rfc/rfc9113.html
  - Useful for streams, frames, and multiplexing over one TCP connection.
- RFC 9293 — Transmission Control Protocol (TCP): https://www.rfc-editor.org/rfc/rfc9293.html
  - Useful for ports, sockets, and demultiplexing incoming segments to applications.
- MDN — WebSockets API: https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API
  - Useful later for practical “many app channels over one socket” demos.
- Node.js test runner: https://nodejs.org/api/test.html
  - Used for course exercises.
- MDN — JavaScript event loop: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Event_loop
  - Used for event loop and queue explanations.
- Python — `select` module: https://docs.python.org/3/library/select.html
  - Useful for readiness-based I/O multiplexing vocabulary.
- MDN — WebRTC API: https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API
  - Useful for real-time media context.

## Course notes

Start with simple channel labels and frames before naming HTTP/2, TCP, or OS-level I/O multiplexing.
