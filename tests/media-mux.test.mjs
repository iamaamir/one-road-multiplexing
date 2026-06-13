import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { jitterBuffer, timeDivisionMux } from '../src/media-mux.mjs';

describe('timeDivisionMux', () => {
  it('interleaves media packets by playback time', () => {
    assert.deepEqual(timeDivisionMux([
      { track: 'audio', packets: [{ at: 0, data: 'a0' }, { at: 20, data: 'a1' }] },
      { track: 'video', packets: [{ at: 0, data: 'v0' }, { at: 33, data: 'v1' }] },
    ]), [
      { at: 0, track: 'audio', data: 'a0' },
      { at: 0, track: 'video', data: 'v0' },
      { at: 20, track: 'audio', data: 'a1' },
      { at: 33, track: 'video', data: 'v1' },
    ]);
  });
});

describe('jitterBuffer', () => {
  it('plays packets by media time after buffering delay, not arrival order', () => {
    assert.deepEqual(jitterBuffer([
      { arrival: 5, at: 20, track: 'audio', data: 'a1' },
      { arrival: 1, at: 0, track: 'audio', data: 'a0' },
    ], 10), [
      { playAt: 10, track: 'audio', data: 'a0' },
      { playAt: 30, track: 'audio', data: 'a1' },
    ]);
  });
});
