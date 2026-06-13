# Mini multiplexed chat capstone

## Evidence
Batch lesson 8 consolidates course primitives into a practical app-channel protocol: channel labels, sequence numbers, chunks, and demultiplexing.

## Challenges
Potential confusion: production protocols require more than this toy model. Lesson calls out backpressure, security, errors, acknowledgements, and observability as future hard parts.

## Engagement Pattern
Learner wanted practical real-world use. Capstone gives a WebSocket-style pattern without requiring server infrastructure.

## Adjust
Next improvement should be hands-on: ask learner to modify chunk size, add a `typing` channel, or implement frame loss detection.
