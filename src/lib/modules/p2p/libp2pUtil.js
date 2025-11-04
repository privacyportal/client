import { noise } from '@chainsafe/libp2p-noise';
import { yamux } from '@chainsafe/libp2p-yamux';
import { circuitRelayTransport } from '@libp2p/circuit-relay-v2';
import { keys } from '@libp2p/crypto';
import { identify } from '@libp2p/identify';
import { FaultTolerance } from '@libp2p/interface-transport';
import { createEd25519PeerId } from '@libp2p/peer-id-factory';
import { ping } from '@libp2p/ping';
import { webRTC } from '@libp2p/webrtc';
import { webSockets } from '@libp2p/websockets';
import { CODE_DNS4, CODE_P2P, CODE_WEBRTC } from '@multiformats/multiaddr';
import { createLibp2p } from 'libp2p';
import { bufferToBase64, stringToBase64 } from '../auth';
import { ORIGIN_DOMAIN, TURN_SERVERS } from '../constants';

// match the webrtc data channel message size and account for overhead
export const MAX_MESSAGE_SIZE = 16 * 1024 - 256;
export const CMD_TIMEOUT = 30000;

const PING_PROTOCOL_PREFIX = 'pportal';
const RELAY_ADDRESS_REGEX = new RegExp(`^p2p-relay-[0-9]+.${ORIGIN_DOMAIN}$`);

export async function generateLibp2pPeerId() {
  return await createEd25519PeerId();
}

export function encodeData(data) {
  const encoder = new TextEncoder();
  return encoder.encode(data);
}

export function decodeData(data) {
  const decoder = new TextDecoder();
  return decoder.decode(data);
}

export async function libp2pSign({ peerId, data }) {
  const privateKey = await keys.privateKeyFromProtobuf(peerId.privateKey);
  const encodedData = encodeData(data);
  return await privateKey.sign(encodedData);
}

export async function libp2pIssueToken({ peerId, data }) {
  const body = stringToBase64(JSON.stringify(data), { url: true });
  const signature = bufferToBase64(await libp2pSign({ peerId, data: body }), { url: true });
  return `${body}.${signature}`;
}

export async function startLibp2pNode({ peerId, session, isSender }) {
  let node = await createLibp2p({
    privateKey: keys.privateKeyFromProtobuf(peerId.privateKey),
    addresses: {
      announceFilter: (addrs) => {
        // only webrtc
        return addrs.filter((addr) => addr.getComponents().some(({ code }) => code === CODE_WEBRTC));
      },
      listen: [
        // Listen for webRTC connections including over Circuit Relay connections
        '/webrtc'
      ]
    },
    transports: [
      // Allow all WebSocket connections inclusing without TLS
      webSockets(),
      // support dialing/listening on WebRTC addresses
      webRTC({
        rtcConfiguration: {
          iceServers: [
            {
              urls: TURN_SERVERS,
              username: session.turn.username,
              credential: session.turn.credential
            }
          ],
          iceTransportPolicy: 'relay'
        },
        dataChannel: {
          // wait for bufferedAmountLow event
          bufferedAmountLowEventTimeout: 60000,

          // Wait for `bufferedAmount` to become 0 before closing the underlying RTCDataChannel
          drainTimeout: 60000,

          // close timeout
          closeTimeout: 20000,

          // wait for FIN acknowlegement message
          finAckTimeout: 20000
        }
      }),
      // support dialing/listening on Circuit Relay addresses
      circuitRelayTransport()
    ],
    connectionEncrypters: [
      noise() // use noise for connection encryption
    ],
    transportManager: {
      faultTolerance: FaultTolerance.NO_FATAL
    },
    // a stream muxer is necessary to dial the relay
    streamMuxers: [
      yamux({
        // keep alive
        enableKeepAlive: true,
        keepAliveInterval: 15000,

        // The total number of inbound protocol streams that can be opened on a given connection
        // This field is optional, the default value is shown
        maxInboundStreams: 100,

        // The total number of outbound protocol streams that can be opened on a given connection
        // This field is optional, the default value is shown
        maxOutboundStreams: 100,

        // set the max message size
        maxMessageSize: MAX_MESSAGE_SIZE,

        streamOptions: {
          // Used to control the maximum window size that we allow for a stream.
          maxStreamWindowSize: 64 * MAX_MESSAGE_SIZE
        }
      })
    ],
    connectionGater: {
      denyInboundConnection: (connection) => {
        // only accept inbound connections from the relay in sender mode

        // accept inbound webrtc connections from peer /webrtc/p2p/<peerId>
        const components = connection.remoteAddr.getComponents();
        if (components.length === 2 && components[0].code === CODE_WEBRTC && components[1].code === CODE_P2P) {
          return false;
        }

        // accept inbound relayed websocket connections for signaling
        try {
          return !(components.length && components[0].code === CODE_DNS4 && RELAY_ADDRESS_REGEX.test(components[0].value));
        } catch (err) {
          console.warn(`denyInboundConnection from ${connection.remoteAddr.toString()} => denied`);
          // block all remaining inbound connections
          return true;
        }
      },
      denyOutboundConnection: (_, connection) => {
        // only accept outbound connections through the relay
        // both sender and receiver use it to-reconnect in case the connection drops

        // accept outbound webrtc connections to peer /webrtc/p2p/<peerId>
        const components = connection.remoteAddr.getComponents();
        if (components.length === 2 && components[0].code === CODE_WEBRTC && components[1].code === CODE_P2P) {
          return false;
        }

        // accept outbound relayed websocket connections for signaling
        try {
          return !(components.length && components[0].code === CODE_DNS4 && RELAY_ADDRESS_REGEX.test(components[0].value));
        } catch {
          console.warn(`denyOutboundConnection to ${connection.remoteAddr.toString()} => denied`);
          // block all remaining outbound connections
          return true;
        }
      },
      denyInboundEncryptedConnection: () => {
        // both sender and receiver require accepting inbound encrypted connections
        return false;
      },
      denyOutboundEncryptedConnection: () => {
        // both sender and receiver require establishing outbound encrypted connections
        return false;
      },
      denyInboundRelayReservation: () => {
        // do not allow clients to act as relays
        return true;
      },
      denyInboundUpgradedConnection: async (_, connection) => {
        // accept inbound upgraded webrtc connections from peer /webrtc/p2p/<peerId>
        const components = connection.remoteAddr.getComponents();
        if (components.length === 2 && components[0].code === CODE_WEBRTC && components[1].code === CODE_P2P) {
          return false;
        }

        // allow relayed inbound upgraded connections
        try {
          return !(components.length && components[0].code === CODE_DNS4 && RELAY_ADDRESS_REGEX.test(components[0].value));
        } catch {
          console.warn(`denyInboundUpgradedConnection from ${connection.remoteAddr.toString()} => denied`);
          // block all remaining outbound connections
          return true;
        }
      },
      denyOutboundUpgradedConnection: () => {
        // both sender and receiver require establishing outbound upgraded connections
        return false;
      },
      denyOutboundRelayedConnection: () => {
        // both sender and receiver require establishing outbound relayed connections
        return false;
      },
      denyInboundRelayedConnection: () => {
        // both sender and receiver require accepting inbound relayed connections
        return false;
      },
      denyDialMultiaddr: (ma) => {
        console.debug('denyDialMultiaddr:', ma, '=> false');
        return false;
      }
    },
    services: {
      identify: identify(),
      ping: ping({
        timeout: 30000,
        maxInboundStreams: 5,
        maxOutboundStreams: 5,
        protocolPrefix: PING_PROTOCOL_PREFIX
      })
    },
    connectionManager: {
      dialTimeout: 60000,

      // The total number of connections allowed to be open at one time
      maxConnections: 5,

      // How many connections can be open but not yet upgraded
      maxIncomingPendingConnections: 5
    },
    connectionMonitor: {
      enabled: true,
      abortConnectionOnPingFailure: true,
      pingInterval: 15000,
      pingTimeout: {
        initialValue: 30000
      },
      protocolPrefix: PING_PROTOCOL_PREFIX
    }
  });

  return node;
}

export async function closeConnections(node, options) {
  const { abort } = { ...options };
  return await Promise.race([
    Promise.all(
      node.getConnections().map((conn) => {
        if (!abort) return conn.close();
        const abortError = abort instanceof Error ? abort : new Error(String(abort));
        return conn.abort(abortError);
      })
    ),
    new Promise((_, reject) => setTimeout(() => reject(new Error('closing connections timeout')), 5000))
  ]).catch((err) => {
    console.error('failed to close connections', err);
  });
}

export async function stopNode(node, options) {
  try {
    // Close all connections
    await closeConnections(node, options);

    // Stop the libp2p node itself
    await node.stop();

    console.info('Libp2p node stopped successfully');
  } catch (err) {
    console.error('Error during node shutdown:', err);
  }
}
