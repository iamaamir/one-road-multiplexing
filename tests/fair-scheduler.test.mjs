import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { fairSchedule, greedySchedule } from '../src/fair-scheduler.mjs';

const channels = [
  { id: 'file', frames: ['F0', 'F1', 'F2', 'F3'] },
  { id: 'chat', frames: ['C0'] },
  { id: 'video', frames: ['V0', 'V1'] },
];

describe('greedySchedule', () => {
  it('sends all frames from one channel before moving to the next', () => {
    assert.deepEqual(greedySchedule(channels), [
      { channelId: 'file', data: 'F0' },
      { channelId: 'file', data: 'F1' },
      { channelId: 'file', data: 'F2' },
      { channelId: 'file', data: 'F3' },
      { channelId: 'chat', data: 'C0' },
      { channelId: 'video', data: 'V0' },
      { channelId: 'video', data: 'V1' },
    ]);
  });
});

describe('fairSchedule', () => {
  it('gives each non-empty channel a turn before repeating a busy channel', () => {
    assert.deepEqual(fairSchedule(channels), [
      { channelId: 'file', data: 'F0' },
      { channelId: 'chat', data: 'C0' },
      { channelId: 'video', data: 'V0' },
      { channelId: 'file', data: 'F1' },
      { channelId: 'video', data: 'V1' },
      { channelId: 'file', data: 'F2' },
      { channelId: 'file', data: 'F3' },
    ]);
  });

  it('supports a quantum so a channel can send limited bursts per turn', () => {
    assert.deepEqual(fairSchedule(channels, 2).map((frame) => `${frame.channelId}:${frame.data}`), [
      'file:F0',
      'file:F1',
      'chat:C0',
      'video:V0',
      'video:V1',
      'file:F2',
      'file:F3',
    ]);
  });
});
