function chunksOf(data, chunkSize) {
  const chunks = [];
  for (let index = 0; index < data.length; index += chunkSize) {
    chunks.push(data.slice(index, index + chunkSize));
  }
  return chunks;
}

export function makeHttp2Frames(streams, chunkSize = 3) {
  const prepared = streams.map((stream) => ({
    streamId: stream.streamId,
    chunks: chunksOf(String(stream.data), chunkSize),
  }));
  const max = Math.max(0, ...prepared.map((stream) => stream.chunks.length));
  const frames = [];

  for (let sequence = 0; sequence < max; sequence += 1) {
    for (const stream of prepared) {
      const data = stream.chunks[sequence];
      if (data === undefined) continue;
      frames.push({ streamId: stream.streamId, sequence, data });
    }
  }

  return frames;
}

export function rebuildHttp2Streams(frames) {
  const grouped = new Map();
  for (const frame of frames) {
    if (!grouped.has(frame.streamId)) grouped.set(frame.streamId, []);
    grouped.get(frame.streamId).push(frame);
  }

  const rebuilt = new Map();
  for (const [streamId, streamFrames] of grouped) {
    rebuilt.set(streamId, streamFrames
      .toSorted((left, right) => left.sequence - right.sequence)
      .map((frame) => frame.data)
      .join(''));
  }
  return rebuilt;
}
