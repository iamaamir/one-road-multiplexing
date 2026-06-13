import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { decodeChannelMessages, encodeChannelMessages } from '../src/mini-mux-chat.mjs';

describe('mini multiplexed chat protocol', () => {
  it('carries chat, presence, and file chunks over one transport', () => {
    const frames = encodeChannelMessages([
      { channel: 'chat', message: 'hello' },
      { channel: 'presence', message: 'online' },
      { channel: 'file', message: 'ABCDEFGH' },
    ], 4);

    assert.deepEqual(frames.map((f) => `${f.channel}:${f.messageId}:${f.sequence}/${f.total}:${f.data}`), [
      'chat:chat-0:0/2:hell',
      'presence:presence-1:0/2:onli',
      'file:file-2:0/2:ABCD',
      'chat:chat-0:1/2:o',
      'presence:presence-1:1/2:ne',
      'file:file-2:1/2:EFGH',
    ]);

    assert.deepEqual(Object.fromEntries(decodeChannelMessages(frames)), {
      chat: 'hello',
      presence: 'online',
      file: 'ABCDEFGH',
    });
  });
});
