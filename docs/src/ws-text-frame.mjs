export function getWebSocketOpcode(buffer) {
  return buffer[0] & 0x0f;
}

export function isWebSocketCloseFrame(buffer) {
  return getWebSocketOpcode(buffer) === 0x8;
}

export function encodeWebSocketCloseFrame() {
  return Buffer.from([0x88, 0x00]);
}

export function decodeWebSocketTextFrame(buffer) {
  const opcode = getWebSocketOpcode(buffer);
  if (opcode === 0x8) return null;
  if (opcode !== 0x1) return null;

  const masked = (buffer[1] & 0x80) !== 0;
  let length = buffer[1] & 0x7f;
  let offset = 2;

  if (length === 126) {
    length = buffer.readUInt16BE(offset);
    offset += 2;
  }
  if (length === 127) return null;
  if (!masked) return buffer.subarray(offset, offset + length).toString('utf8');

  const mask = buffer.subarray(offset, offset + 4);
  offset += 4;
  const payload = Buffer.alloc(length);
  for (let index = 0; index < length; index += 1) {
    payload[index] = buffer[offset + index] ^ mask[index % 4];
  }
  return payload.toString('utf8');
}

export function encodeWebSocketTextFrame(text) {
  const payload = Buffer.from(text, 'utf8');
  if (payload.length < 126) {
    return Buffer.concat([Buffer.from([0x81, payload.length]), payload]);
  }
  const header = Buffer.alloc(4);
  header[0] = 0x81;
  header[1] = 126;
  header.writeUInt16BE(payload.length, 2);
  return Buffer.concat([header, payload]);
}
