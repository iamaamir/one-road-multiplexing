function readEvent(socket, time) {
  return { time, socketId: socket.id, payload: socket.payload };
}

export function blockingReadOrder(sockets) {
  let currentTime = 0;
  const events = [];

  for (const socket of sockets) {
    currentTime = Math.max(currentTime, socket.readyAt);
    events.push(readEvent(socket, currentTime));
  }

  return events;
}

export function readinessOrder(sockets) {
  return [...sockets]
    .sort((left, right) => left.readyAt - right.readyAt || String(left.id).localeCompare(String(right.id)))
    .map((socket) => readEvent(socket, socket.readyAt));
}
