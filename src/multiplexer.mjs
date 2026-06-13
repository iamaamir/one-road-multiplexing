function chunkPayload(payload, chunkSize) {
  if (!Number.isInteger(chunkSize) || chunkSize < 1) {
    throw new RangeError('chunkSize must be a positive integer');
  }

  const chunks = [];
  for (let index = 0; index < payload.length; index += chunkSize) {
    chunks.push(payload.slice(index, index + chunkSize));
  }
  return chunks;
}

export function multiplexChannels(channels, chunkSize = 3) {
  const prepared = channels.map((channel) => ({
    id: channel.id,
    chunks: chunkPayload(String(channel.payload), chunkSize),
  }));

  const frames = [];
  const maxChunks = Math.max(0, ...prepared.map((channel) => channel.chunks.length));

  for (let sequence = 0; sequence < maxChunks; sequence += 1) {
    for (const channel of prepared) {
      const data = channel.chunks[sequence];
      if (data === undefined) continue;
      frames.push({ channelId: channel.id, sequence, data });
    }
  }

  return frames;
}

export function demultiplexFrames(frames) {
  const byChannel = new Map();

  for (const frame of frames) {
    if (!byChannel.has(frame.channelId)) byChannel.set(frame.channelId, []);
    byChannel.get(frame.channelId).push(frame);
  }

  const rebuilt = new Map();
  for (const [channelId, channelFrames] of byChannel) {
    const payload = channelFrames
      .toSorted((left, right) => left.sequence - right.sequence)
      .map((frame) => frame.data)
      .join('');
    rebuilt.set(channelId, payload);
  }

  return rebuilt;
}
