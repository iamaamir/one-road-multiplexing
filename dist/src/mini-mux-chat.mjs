function chunksOf(message, chunkSize) {
  const chunks = [];
  for (let index = 0; index < message.length; index += chunkSize) {
    chunks.push(message.slice(index, index + chunkSize));
  }
  return chunks;
}

export function encodeChannelMessages(messages, chunkSize = 4) {
  const prepared = messages.map((message, index) => {
    const chunks = chunksOf(String(message.message), chunkSize);
    return {
      channel: message.channel,
      messageId: message.messageId ?? `${message.channel}-${index}`,
      total: chunks.length,
      chunks,
    };
  });
  const max = Math.max(0, ...prepared.map((message) => message.chunks.length));
  const frames = [];

  for (let sequence = 0; sequence < max; sequence += 1) {
    for (const message of prepared) {
      const data = message.chunks[sequence];
      if (data === undefined) continue;
      frames.push({ channel: message.channel, messageId: message.messageId, sequence, total: message.total, data });
    }
  }

  return frames;
}

export function decodeChannelMessages(frames) {
  const grouped = new Map();
  for (const frame of frames) {
    if (!grouped.has(frame.channel)) grouped.set(frame.channel, []);
    grouped.get(frame.channel).push(frame);
  }

  const decoded = new Map();
  for (const [channel, channelFrames] of grouped) {
    decoded.set(channel, channelFrames
      .toSorted((left, right) => left.sequence - right.sequence)
      .map((frame) => frame.data)
      .join(''));
  }
  return decoded;
}
