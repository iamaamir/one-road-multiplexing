function normalizeProtocol(protocol) {
  return String(protocol).toLowerCase();
}

function endpointKey(protocol, ip, port) {
  return `${normalizeProtocol(protocol)}://${ip}:${port}`;
}

function wildcardKey(protocol, port) {
  return endpointKey(protocol, '0.0.0.0', port);
}

export function socketKey(socket) {
  return endpointKey(socket.protocol, socket.localIp, socket.localPort);
}

function segmentKeys(segment) {
  return [
    endpointKey(segment.protocol, segment.dstIp, segment.dstPort),
    wildcardKey(segment.protocol, segment.dstPort),
  ];
}

function listenerIndex(listeners) {
  const index = new Map();

  for (const listener of listeners) {
    index.set(socketKey(listener), listener);
  }

  return index;
}

function emptyDeliveryMap(listeners) {
  const delivered = new Map();

  for (const listener of listeners) {
    delivered.set(listener.app, []);
  }
  delivered.set('dropped', []);

  return delivered;
}

function findListener(index, segment) {
  for (const key of segmentKeys(segment)) {
    const listener = index.get(key);
    if (listener) return listener;
  }
  return null;
}

export function demultiplexSegments(listeners, segments) {
  const index = listenerIndex(listeners);
  const delivered = emptyDeliveryMap(listeners);

  for (const segment of segments) {
    const listener = findListener(index, segment);
    const bucket = listener ? listener.app : 'dropped';
    delivered.get(bucket).push(segment.payload);
  }

  return delivered;
}
