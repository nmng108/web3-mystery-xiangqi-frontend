import React, { Context, createContext, PropsWithChildren, useCallback, useEffect, useState } from 'react';
import {
  type BaseConnectionErrorType,
  type DataConnection,
  type DataConnectionErrorType,
  Peer,
  PeerError,
  PeerErrorType,
  type PeerOptions,
} from 'peerjs';
import env from '../env.ts';
import { isNonZeroAddress, isSameAddress } from '../utilities';
import { type AddressLike } from 'ethers';
import { useAuthContext, useGlobalContext, useWalletProviderContext } from '../hooks';

let path: string = env.PEER_SERVER_PATH ?? undefined;

if (path) {
  path = path.startsWith('/') ? path : `/${path}`;
}

const fixedPeerOptions: PeerOptions = {
  host: env.PEER_SERVER_HOST,
  port: env.PEER_SERVER_PORT,
  path: path,
  secure: env.PEER_SERVER_SECURE,
  pingInterval: env.PEER_SERVER_PING_INTERVAL,
  debug: env.PEER_SERVER_DEBUG,
  config: {
    iceServers: [{ url: 'stun:stun.l.google.com:19302' }],
  },
};

if (env.PEER_SERVER_KEY) {
  fixedPeerOptions.key = env.PEER_SERVER_KEY;
}

const SERVER_RECONNECT_INTERVAL: number = 3000; // retry every 3 seconds

interface PeerContextProps {
  peer: Peer;
  opponentConnection: DataConnection;
  // setAddress: (address: AddressLike) => void;
  connectOpponentPeerAddress: (address: AddressLike) => void;
}

export const PeerContext: Context<PeerContextProps> = createContext<PeerContextProps>(undefined);

export const PeerContextProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [peer, setPeer] = useState<Peer>();
  const [opponentConnection, setOpponentConnection] = useState<DataConnection>();
  const { selectedAccount, disconnectWallet } = useWalletProviderContext();
  const { setFullscreenToastMessage } = useGlobalContext();
  const { setAuthMessage } = useAuthContext();
  const [isConnectingpeerServer, setIsConnectingpeerServer] = useState<boolean>(false);

  // const setAddress = useCallback(
  //   async (addr: AddressLike) => {
  //     let newPeer: Peer;
  //
  //     if (isNonZeroAddress(addr) && (!peer || !isSameAddress(peer.id, addr))) {
  //       console.log('before calling Peer constructor with params: ', peer?.id, addr);
  //       newPeer = new Peer(addr.toString(), { ...peerOptions });
  //       console.log('after calling Peer constructor with params: ', peer?.id, addr, ' | token=', newPeer.options.token);
  //
  //       setPeer(newPeer);
  //     }
  //   },
  //   [peer, token]
  // );

  const connectOpponentPeerAddress = useCallback(
    async (addr: AddressLike) => {
      if (peer?.open && isNonZeroAddress(addr)) {
        const newOpponentConnection: DataConnection = peer.connect(addr.toString().toLowerCase());

        setOpponentConnection(newOpponentConnection);
        console.log('Establishing connection to opponent...');
      } else if (!isNonZeroAddress(addr)) {
        setOpponentConnection(null);
      } else {
        setFullscreenToastMessage({
          message: 'Connecting to opponent failed. Retrying...',
          level: 'error',
          duration: 6000,
        });
        console.log('cannot set up peer connection to opponent. Reason: cannot connect to server');
      }
    },
    [peer, setFullscreenToastMessage]
  );

  // Set `peer` variable everytime signing in or switching account
  useEffect(() => {
    try {
      if (isNonZeroAddress(selectedAccount) && (!peer || !isSameAddress(peer.id, selectedAccount))) {
        const newPeer = new Peer(selectedAccount.toLowerCase(), fixedPeerOptions);

        setPeer(newPeer);
      } else if (!isNonZeroAddress(selectedAccount)) {
        // If logging out or switching account
        peer?.disconnect();
        setPeer(null);
        console.log(
          `Detected ${selectedAccount ? 'account switching' : 'logging out'} action. Disconnecting peer server...`
        );
      }
    } catch (err) {
      console.log('[peer server connection error] ', err);
    }
  }, [peer, selectedAccount]);

  // Set up event listeners for `peer`
  useEffect(() => {
    const handleOpen = (id: AddressLike) => {
      console.log(`[peer open event] Opened connection to peer server using ID=${id}`);
      setIsConnectingpeerServer(false);
      // setToken(peer.options.token);
    };
    const handleConnection = (connection: DataConnection) => {
      console.log(`[peer connection event] Received connection offer from a peer (ID=${connection.peer})`);
      setOpponentConnection(connection);
    };
    const handleClose = () => {
      console.log(`[peer close event] Closed connection to peer server. Remove all listeners`);
      setIsConnectingpeerServer(true);
    };
    const handleError = (error: PeerError<`${PeerErrorType}`>) => {
      console.log('[peer error] type: %s, name: %s, message: %s', error.type, error.name, error.message);

      // try to reconnect to peer server every 3s
      if (error.type == PeerErrorType.Network) {
        setIsConnectingpeerServer(true);
      }
    };

    if (peer) {
      peer.on('open', handleOpen);
      peer.on('connection', handleConnection);
      peer.on('close', handleClose);
      peer.on('error', handleError);
    }

    return () => {
      if (peer) {
        peer.off('open', handleOpen);
        peer.off('connection', handleConnection);
        peer.off('close', handleClose);
        peer.off('error', handleError);
        // console.log(`[peer disconnect] Disconnecting peer server...`);
      }
    };
  }, [peer, selectedAccount]);

  // Set up handler for error 'unavailable-id'
  // If user logs in, immediately log user out from app if there's already a connection from that account to peer server.
  useEffect(() => {
    const handleError = (error: PeerError<`${PeerErrorType}`>) => {
      if (error.type == 'unavailable-id') {
        setAuthMessage({ message: 'Account is currently logged in somewhere else', level: 'error' });
        disconnectWallet();
      }
    };

    if (peer) {
      peer.on('error', handleError);
    }

    return () => {
      peer?.off('error', handleError);
    };
  }, [peer, disconnectWallet, setAuthMessage]);

  // Set up event listeners for `opponentConnection`
  useEffect(() => {
    let handleOpen: () => void;
    let handleClose: () => void;
    let handleError: (error: PeerError<`${BaseConnectionErrorType | DataConnectionErrorType}`>) => void;
    let handleIceStateChanged: (state: RTCIceConnectionState) => void;

    if (opponentConnection) {
      handleOpen = () => {
        console.log(
          `[peer connection open event] Connected to opponent peer (ID=${opponentConnection.peer.toString()})`
        );
      };
      handleClose = () => {
        console.log('[peer connection close event] Closed connection to opponent peer.');
        // setOpponentConnection(null);
      };
      handleError = (error) => {
        console.log(
          '[peer connection error event] type: %s, name: %s, message: %s',
          error.type,
          error.name,
          error.message
        );
      };
      handleIceStateChanged = (state) => {
        console.log('[peer connection iceStateChanged event] ICE state changed: ', state);
        // if (state == 'connected') opponentConnection.send({hi_from_ice: 'hellooo !!!'})
      };
      opponentConnection.on('open', handleOpen);
      opponentConnection.on('close', handleClose);
      opponentConnection.on('error', handleError);
      opponentConnection.on('iceStateChanged', handleIceStateChanged);
    }

    return () => {
      if (opponentConnection) {
        opponentConnection.off('open', handleOpen);
        opponentConnection.off('close', handleClose);
        opponentConnection.off('error', handleError);
        opponentConnection.off('iceStateChanged', handleIceStateChanged);
      }
    };
  }, [opponentConnection]);

  useEffect(() => {
    const serverReconnectionAttempt = isConnectingpeerServer
      ? setInterval(() => {
          if (isNonZeroAddress(selectedAccount)) {
            setPeer(new Peer(selectedAccount.toLowerCase(), fixedPeerOptions));
            console.log(
              `(every ${Math.floor(SERVER_RECONNECT_INTERVAL / 1000)}s + request time) Reconnecting to peer server...`
            );
          }
        }, SERVER_RECONNECT_INTERVAL)
      : null;

    return () => {
      if (isConnectingpeerServer) {
        clearInterval(serverReconnectionAttempt);
      }
    };
  }, [isConnectingpeerServer, selectedAccount]);

  const contextValue: PeerContextProps = { peer, opponentConnection, connectOpponentPeerAddress };

  return <PeerContext.Provider value={contextValue}>{children}</PeerContext.Provider>;
};
