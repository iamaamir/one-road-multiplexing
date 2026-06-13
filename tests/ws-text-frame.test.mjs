import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { decodeWebSocketTextFrame, encodeWebSocketCloseFrame, encodeWebSocketTextFrame, isWebSocketCloseFrame } from '../src/ws-text-frame.mjs';

describe('WebSocket text frame codec', () => {
  it('encodes and decodes unmasked server text frames', () => {
    const frame = encodeWebSocketTextFrame('hello');
    assert.equal(decodeWebSocketTextFrame(frame), 'hello');
  });

  it('decodes masked browser text frames', () => {
    const payload = Buffer.from('hi');
    const mask = Buffer.from([1, 2, 3, 4]);
    const masked = Buffer.from(payload.map((byte, index) => byte ^ mask[index % 4]));
    const frame = Buffer.concat([Buffer.from([0x81, 0x80 | payload.length]), mask, masked]);
    assert.equal(decodeWebSocketTextFrame(frame), 'hi');
  });

  it('detects and encodes close frames for the teaching server handshake', () => {
    assert.equal(isWebSocketCloseFrame(Buffer.from([0x88, 0x00])), true);
    assert.deepEqual([...encodeWebSocketCloseFrame()], [0x88, 0x00]);
  });
});
