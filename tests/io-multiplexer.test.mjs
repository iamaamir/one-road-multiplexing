import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { blockingReadOrder, readinessOrder } from '../src/io-multiplexer.mjs';

const sockets = [
  { id: 'A', readyAt: 5, payload: 'slow client' },
  { id: 'B', readyAt: 1, payload: 'chat ping' },
  { id: 'C', readyAt: 3, payload: 'api request' },
];

describe('blockingReadOrder', () => {
  it('waits on sockets in listed order even when later sockets are ready earlier', () => {
    assert.deepEqual(blockingReadOrder(sockets), [
      { time: 5, socketId: 'A', payload: 'slow client' },
      { time: 5, socketId: 'B', payload: 'chat ping' },
      { time: 5, socketId: 'C', payload: 'api request' },
    ]);
  });
});

describe('readinessOrder', () => {
  it('processes whichever socket becomes ready next', () => {
    assert.deepEqual(readinessOrder(sockets), [
      { time: 1, socketId: 'B', payload: 'chat ping' },
      { time: 3, socketId: 'C', payload: 'api request' },
      { time: 5, socketId: 'A', payload: 'slow client' },
    ]);
  });

  it('uses socket id as a stable tie-breaker when sockets become ready at the same time', () => {
    const tied = [
      { id: 'socket-2', readyAt: 2, payload: 'two' },
      { id: 'socket-1', readyAt: 2, payload: 'one' },
    ];

    assert.deepEqual(readinessOrder(tied).map((event) => event.socketId), ['socket-1', 'socket-2']);
  });
});
