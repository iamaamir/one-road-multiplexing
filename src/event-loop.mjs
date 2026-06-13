export function scheduleEventLoop(events) {
  return [...events]
    .sort((left, right) => left.readyAt - right.readyAt
      || queueRank(left) - queueRank(right)
      || left.callback.localeCompare(right.callback))
    .map((event, index) => ({
      tick: index + 1,
      queue: event.priority === 'microtask' ? 'microtask' : 'task',
      callback: event.callback,
      source: event.source,
    }));
}

function queueRank(event) {
  return event.priority === 'microtask' ? 0 : 1;
}
