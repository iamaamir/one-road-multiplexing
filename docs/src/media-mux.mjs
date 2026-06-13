export function timeDivisionMux(tracks) {
  return tracks
    .flatMap((track) => track.packets.map((packet) => ({
      at: packet.at,
      track: track.track,
      data: packet.data,
    })))
    .sort((left, right) => left.at - right.at || left.track.localeCompare(right.track));
}

export function jitterBuffer(packets, delay = 1) {
  return [...packets]
    .sort((left, right) => left.at - right.at || left.track.localeCompare(right.track))
    .map((packet) => ({
      playAt: packet.at + delay,
      track: packet.track,
      data: packet.data,
    }));
}
