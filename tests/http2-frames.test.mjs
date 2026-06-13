import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { makeHttp2Frames, rebuildHttp2Streams } from '../src/http2-frames.mjs';

describe('HTTP/2 frame model', () => {
  it('interleaves frames from streams and rebuilds them by stream id', () => {
    const frames = makeHttp2Frames([
      { streamId: 1, data: 'HEADERS /a' },
      { streamId: 3, data: 'HEADERS /b' },
    ], 4);

    assert.deepEqual(frames.map((f) => `${f.streamId}:${f.sequence}:${f.data}`), [
      '1:0:HEAD',
      '3:0:HEAD',
      '1:1:ERS ',
      '3:1:ERS ',
      '1:2:/a',
      '3:2:/b',
    ]);

    assert.deepEqual(Object.fromEntries(rebuildHttp2Streams(frames)), {
      1: 'HEADERS /a',
      3: 'HEADERS /b',
    });
  });
});
