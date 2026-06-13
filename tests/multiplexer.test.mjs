import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { multiplexChannels, demultiplexFrames } from '../src/multiplexer.mjs';

describe('multiplexChannels', () => {
  it('interleaves chunks from multiple logical channels onto one shared connection', () => {
    const frames = multiplexChannels([
      { id: 'chat', payload: 'hello' },
      { id: 'file', payload: 'ABCDEF' },
    ], 2);

    assert.deepEqual(frames.map((frame) => `${frame.channelId}:${frame.sequence}:${frame.data}`), [
      'chat:0:he',
      'file:0:AB',
      'chat:1:ll',
      'file:1:CD',
      'chat:2:o',
      'file:2:EF',
    ]);
  });
});

describe('demultiplexFrames', () => {
  it('rebuilds each logical channel from mixed frames using channel id and sequence', () => {
    const frames = [
      { channelId: 'file', sequence: 1, data: 'CD' },
      { channelId: 'chat', sequence: 0, data: 'he' },
      { channelId: 'file', sequence: 0, data: 'AB' },
      { channelId: 'chat', sequence: 1, data: 'y' },
    ];

    assert.deepEqual(Object.fromEntries(demultiplexFrames(frames)), {
      chat: 'hey',
      file: 'ABCD',
    });
  });
});
