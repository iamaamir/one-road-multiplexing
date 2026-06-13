import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { demultiplexSegments, socketKey } from '../src/port-demux.mjs';

describe('socketKey', () => {
  it('identifies an app listener by protocol, local ip, and local port', () => {
    assert.equal(socketKey({ protocol: 'tcp', localIp: '127.0.0.1', localPort: 8080 }), 'tcp://127.0.0.1:8080');
  });
});

describe('demultiplexSegments', () => {
  it('delivers incoming segments to the listener matching destination protocol ip and port', () => {
    const listeners = [
      { protocol: 'tcp', localIp: '127.0.0.1', localPort: 8080, app: 'web server' },
      { protocol: 'tcp', localIp: '127.0.0.1', localPort: 5432, app: 'database' },
      { protocol: 'udp', localIp: '127.0.0.1', localPort: 5353, app: 'local discovery' },
    ];

    const segments = [
      { protocol: 'tcp', dstIp: '127.0.0.1', dstPort: 5432, payload: 'SELECT 1' },
      { protocol: 'tcp', dstIp: '127.0.0.1', dstPort: 8080, payload: 'GET /' },
      { protocol: 'udp', dstIp: '127.0.0.1', dstPort: 5353, payload: 'who-is.local' },
      { protocol: 'tcp', dstIp: '127.0.0.1', dstPort: 9999, payload: 'nobody home' },
    ];

    const delivered = demultiplexSegments(listeners, segments);

    assert.deepEqual(Object.fromEntries(delivered), {
      'web server': ['GET /'],
      database: ['SELECT 1'],
      'local discovery': ['who-is.local'],
      dropped: ['nobody home'],
    });
  });

  it('keeps tcp and udp ports separate even when numbers match', () => {
    const listeners = [
      { protocol: 'tcp', localIp: '0.0.0.0', localPort: 53, app: 'tcp dns' },
      { protocol: 'udp', localIp: '0.0.0.0', localPort: 53, app: 'udp dns' },
    ];

    const segments = [
      { protocol: 'udp', dstIp: '192.168.1.10', dstPort: 53, payload: 'dns query' },
      { protocol: 'tcp', dstIp: '192.168.1.10', dstPort: 53, payload: 'dns zone transfer' },
    ];

    const delivered = demultiplexSegments(listeners, segments);

    assert.deepEqual(Object.fromEntries(delivered), {
      'tcp dns': ['dns zone transfer'],
      'udp dns': ['dns query'],
      dropped: [],
    });
  });
});
