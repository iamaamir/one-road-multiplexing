// Teaching-only WebSocket server.
// This intentionally implements a tiny subset of RFC 6455 so learners can see
// frames moving over one socket. Do not expose this server to the internet.
// Production WebSocket servers need full frame parsing, origin checks,
// authentication, rate limits, backpressure, ping/pong, close handling, and TLS.

import { createServer } from 'node:http';
import { createHash } from 'node:crypto';
import { decodeWebSocketTextFrame, encodeWebSocketCloseFrame, encodeWebSocketTextFrame, isWebSocketCloseFrame } from '../src/ws-text-frame.mjs';

const PORT = Number(process.env.PORT || 8765);
const clients = new Set();

const server = createServer((_, res) => {
  res.writeHead(200, { 'content-type': 'text/plain' });
  res.end('Teaching-only mini WebSocket server. Local demo only. Connect with project/mini-ws-chat.html.\n');
});

server.on('upgrade', (req, socket) => {
  if (req.headers.upgrade?.toLowerCase() !== 'websocket') {
    socket.destroy();
    return;
  }

  const accept = createHash('sha1')
    .update(`${req.headers['sec-websocket-key']}258EAFA5-E914-47DA-95CA-C5AB0DC85B11`)
    .digest('base64');

  socket.write([
    'HTTP/1.1 101 Switching Protocols',
    'Upgrade: websocket',
    'Connection: Upgrade',
    `Sec-WebSocket-Accept: ${accept}`,
    '',
    '',
  ].join('\r\n'));

  clients.add(socket);
  socket.on('data', (buffer) => handleClientData(socket, buffer));
  socket.on('close', () => clients.delete(socket));
  socket.on('error', () => clients.delete(socket));
});

function handleClientData(sender, buffer) {
  if (isWebSocketCloseFrame(buffer)) {
    clients.delete(sender);
    sender.write(encodeWebSocketCloseFrame());
    sender.end();
    return;
  }

  const message = decodeWebSocketTextFrame(buffer);
  if (message === null) return;
  for (const client of clients) {
    if (client.destroyed) continue;
    client.write(encodeWebSocketTextFrame(message));
  }
}

server.listen(PORT, () => {
  console.log(`Mini multiplexed chat WebSocket server: ws://localhost:${PORT}`);
});
