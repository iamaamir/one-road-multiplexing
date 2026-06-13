function copyQueues(channels) {
  return channels.map((channel) => ({
    id: channel.id,
    frames: [...channel.frames],
  }));
}

function toFrame(channelId, data) {
  return { channelId, data };
}

export function greedySchedule(channels) {
  const scheduled = [];

  for (const channel of channels) {
    for (const data of channel.frames) {
      scheduled.push(toFrame(channel.id, data));
    }
  }

  return scheduled;
}

export function fairSchedule(channels, quantum = 1) {
  if (!Number.isInteger(quantum) || quantum < 1) {
    throw new RangeError('quantum must be a positive integer');
  }

  const queues = copyQueues(channels);
  const scheduled = [];

  while (queues.some((channel) => channel.frames.length > 0)) {
    for (const channel of queues) {
      for (let sent = 0; sent < quantum; sent += 1) {
        const data = channel.frames.shift();
        if (data === undefined) break;
        scheduled.push(toFrame(channel.id, data));
      }
    }
  }

  return scheduled;
}
