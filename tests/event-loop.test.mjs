import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { scheduleEventLoop } from '../src/event-loop.mjs';

describe('scheduleEventLoop', () => {
  it('turns readiness events into queued callbacks in time order', () => {
    const result = scheduleEventLoop([
      { source: 'socket', readyAt: 4, callback: 'onMessage' },
      { source: 'timer', readyAt: 2, callback: 'onTimeout' },
      { source: 'promise', readyAt: 2, callback: 'thenHandler', priority: 'microtask' },
    ]);

    assert.deepEqual(result, [
      { tick: 1, queue: 'microtask', callback: 'thenHandler', source: 'promise' },
      { tick: 2, queue: 'task', callback: 'onTimeout', source: 'timer' },
      { tick: 3, queue: 'task', callback: 'onMessage', source: 'socket' },
    ]);
  });
});
