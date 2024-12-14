import React, { Context, createContext, PropsWithChildren, useEffect, useMemo, useState } from 'react';
import { type BaseConnectionErrorType, type DataConnectionErrorType, PeerError, type PeerErrorType } from 'peerjs';
import { useAuthContext, useGlobalContext, usePeerContext } from '../hooks';
import { isNonZeroAddress, isPositiveBigNumber, isSameAddress } from '../utilities';
import { MysteryChineseChess } from '../contracts/typechain-types';
import { ContractError } from '../contracts/abi';

/**
 * If total time of request for establish P2P connection to opponent player reaches this value,
 * a (set of) action should be taken depending on specific context.
 */
const MAX_PEER_CONNECTION_ESTABLISHMENT_TIME: number = 60 * 1000; // ms
const PEER_RECONNECT_INTERVAL: number = 2000; // ms

interface InTableContextProps {
  players: MysteryChineseChess.PlayerStruct[];
  isHost: boolean;
  isConnectingToPeer: boolean;
  setIsConnectingToPeer: React.Dispatch<React.SetStateAction<boolean>>;
  connectedToOpponent: boolean;
  keepsConnectionFromStart: boolean;
  setKeepsConnectionFromStart: React.Dispatch<React.SetStateAction<boolean>>;
  peerConnectionTimedOut: boolean;
}

export const InTableContext: Context<InTableContextProps> = createContext<InTableContextProps>(undefined);

export const InTableContextProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [players, setPlayers] = useState<MysteryChineseChess.PlayerStruct[]>([null, null]);
  const [isConnectingToPeer, setIsConnectingToPeer] = useState<boolean>(false);
  /**
   * Actively switch this state's value when connection state (`opponentConnection.open`) changes,
   * by which trigger other essential effects.
   */
  const [connectedToOpponent, setConnectedToOpponent] = useState<boolean>(false);
  const [peerReconnectionTime, setPeerReconnectionTime] = useState<number>(0);
  /**
   * Store counter for number of time reconnecting to peer.<br>
   * Multiply this value and compare to `MAX_PEER_CONNECTION_ESTABLISHMENT_TIME` to determine when the attempt should be stopped.<br>
   * if `isConnectingToPeer` => value = 0
   */
  const [peerReconnectionCounter, setPeerReconnectionCounter] = useState<number>();
  /**
   * True when user is still keeping connection from the time starting current match (not reloading or closing app).
   * Being read only in game.
   */
  const [keepsConnectionFromStart, setKeepsConnectionFromStart] = useState<boolean>(false);
  const { currentTable, setFullscreenToastMessage } = useGlobalContext();
  const { contract, user } = useAuthContext();
  const { peer, opponentConnection, connectOpponentPeerAddress } = usePeerContext();
  /**
   * False when `user` or `currentTable` is null or not found `user`'s address in `currentTable`, and true otherwise.
   */
  const isHost = useMemo(
    () => isSameAddress(currentTable?.players[Number(currentTable.hostIndex)], user?.playerAddress),
    [currentTable?.players, currentTable?.hostIndex, user?.playerAddress]
  );
  const inTableAndHasEnoughPlayers: boolean = useMemo(
    () => currentTable?.players.filter(isNonZeroAddress).length == 2,
    [currentTable?.players]
  );
  const opponentAddress = useMemo(
    () => currentTable?.players.find((addr) => !isSameAddress(addr, user.playerAddress)),
    [currentTable?.players, user?.playerAddress]
  );

  // Set up handler for error 'peer-unavailable'
  useEffect(() => {
    if (!currentTable) {
      return;
    }

    const handleError = (error: PeerError<`${PeerErrorType}`>) => {
      // try to reconnect to opponent peer every 3s
      if (error.type == 'peer-unavailable') {
        setIsConnectingToPeer(true);
        setConnectedToOpponent(false);
      }
    };

    peer?.on('error', handleError);

    return () => {
      peer?.off('error', handleError);
    };
  }, [peer, peer?.open, opponentConnection, connectOpponentPeerAddress, isHost, peerReconnectionTime, currentTable]);

  // Handle opponentConnection's events: 'open', 'close' & 'error'.
  useEffect(() => {
    if (!currentTable) {
      return;
    }

    let handleOpen: () => void;
    let handleClose: () => void;
    let handleError: (error: PeerError<`${BaseConnectionErrorType | DataConnectionErrorType}`>) => void;
    let handleIceStateChanged: (state: RTCIceConnectionState) => void;

    if (opponentConnection) {
      handleOpen = () => {
        setIsConnectingToPeer(false);
        setConnectedToOpponent(true);
      };
      handleClose = () => {
        // If the disconnection is caused by player having exited table/match, do not try to reconnect
        if (!inTableAndHasEnoughPlayers) {
          return;
        }

        console.log('trigger reconnection (from handleClose)');
        setIsConnectingToPeer(true);
        setConnectedToOpponent(false);
      };
      handleError = () => {
        console.log('trigger reconnection (from handleError)');
        setIsConnectingToPeer(true);
        setConnectedToOpponent(false);
      };
      handleIceStateChanged = (state) => {
        if (!['disconnected', 'closed', 'failed'].includes(state)) return;

        console.log('trigger reconnection (from handleIceStateChanged)');
        setIsConnectingToPeer(true);
        setConnectedToOpponent(false);
      };

      opponentConnection.on('open', handleOpen);
      opponentConnection.on('close', handleClose);
      opponentConnection.on('error', handleError);
      opponentConnection.on('iceStateChanged', handleIceStateChanged);
    }

    return () => {
      opponentConnection?.off('open', handleOpen);
      opponentConnection?.off('close', handleClose);
      opponentConnection?.off('error', handleError);
      opponentConnection?.off('iceStateChanged', handleIceStateChanged);
    };
  }, [
    connectOpponentPeerAddress,
    peerReconnectionTime,
    currentTable,
    isConnectingToPeer,
    isHost,
    opponentConnection,
    peer?.open,
    setIsConnectingToPeer,
    inTableAndHasEnoughPlayers,
  ]);

  // 1. Count connectionEstablishmentTime from 0 to its max value
  // 2. If being a host, try to reconnect to his opponent.
  // useEffect(() => {
  //   if (!currentTable) {
  //     return;
  //   }
  //
  //   const oneSecond: number = 1000; // ms
  //   let counter;
  //
  //   if (
  //     isConnectingToPeer &&
  //     peer?.open &&
  //     inTableAndHasEnoughPlayers &&
  //     peerReconnectionTime >= 0 && // != undefined
  //     peerReconnectionTime <= MAX_PEER_CONNECTION_ESTABLISHMENT_TIME - oneSecond
  //   ) {
  //     counter = setInterval(() => {
  //       setPeerReconnectionTime((prev) => prev + oneSecond);
  //     }, oneSecond);
  //   }
  //
  //   return () => {
  //     if (counter) {
  //       clearInterval(counter);
  //     }
  //   };
  // }, [currentTable, inTableAndHasEnoughPlayers, isConnectingToPeer, peer?.open, peerReconnectionTime]);

  // Set reconnection counter
  useEffect(() => {
    if (isConnectingToPeer) {
      setPeerReconnectionCounter(0);
    } else {
      console.log('turn off periodic job');
      setPeerReconnectionCounter(null);
    }
  }, [isConnectingToPeer]);

  // Set periodic retry job
  // Ensure that dependencies should keep unchanged (except `peerReconnectionCounter`) during the reconnection process,
  // if those are not supposed to turn on/off the job.
  useEffect(() => {
    // if (isNonZeroAddress(opponentAddress)) {
    //   return;
    // }

    let peerReconnectionAttempt;

    if (
      peerReconnectionCounter !== null &&
      peerReconnectionCounter >= 0 &&
      (peerReconnectionCounter + 1) * PEER_RECONNECT_INTERVAL <= MAX_PEER_CONNECTION_ESTABLISHMENT_TIME &&
      isHost
    ) {
      peerReconnectionAttempt = setInterval(() => {
        connectOpponentPeerAddress(opponentAddress);
        setPeerReconnectionCounter((prev) => prev + 1);
        console.log(
          `(every ${Math.floor(PEER_RECONNECT_INTERVAL / 1000)}s) Reconnecting to peer (ID=${opponentAddress} ... (Reason: connection closed)`
        );
      }, PEER_RECONNECT_INTERVAL);
    }

    return () => {
      if (peerReconnectionAttempt) {
        clearInterval(peerReconnectionAttempt);
        console.log('clear interval');
      }
    };
  }, [connectOpponentPeerAddress, isHost, opponentAddress, peerReconnectionCounter]);

  // Executed firstly to (re)connect to opponent in case 2 players lost connection to each other (due to any reason)
  // Note: ONLY host sends offer for peer connection establishment
  useEffect(() => {
    if (
      isHost &&
      inTableAndHasEnoughPlayers &&
      peer?.open && // Requires connection to peer server
      !connectedToOpponent &&
      !isConnectingToPeer
    ) {
      if (isNonZeroAddress(opponentAddress)) {
        connectOpponentPeerAddress(opponentAddress);
        console.log(`Start connecting to opponent (ID=${opponentAddress} ...`);
      }
    }
  }, [
    opponentAddress,
    user,
    peer?.open,
    opponentConnection?.open,
    connectOpponentPeerAddress,
    isHost,
    isConnectingToPeer,
    setIsConnectingToPeer,
    inTableAndHasEnoughPlayers,
    connectedToOpponent,
  ]);

  // Set player information to be rendered (state variable: `players`)
  useEffect(() => {
    if (currentTable) {
      (async function () {
        const players: MysteryChineseChess.PlayerStruct[] = [null, null];

        for (let i = 0; i < currentTable.players.length; i++) {
          const address = currentTable.players[i];

          if (!isNonZeroAddress(address)) {
            continue;
          }

          if (isSameAddress(user.playerAddress, address)) {
            players[i] = user;
          } else {
            players[i] = await contract.getPlayer(address as never).catch((err) => {
              if (err.revert?.name == ContractError.ResourceNotFound) {
                setFullscreenToastMessage({
                  message: 'Failed to retrieve opponent information',
                  level: 'error',
                });
              } else {
                console.error(err);
              }

              return null;
            });
          }
        }

        setPlayers(players);
      })();
    } else {
      setPlayers([]);
    }
  }, [contract, user, currentTable, setFullscreenToastMessage]);

  // In case user plays from the start to the end of a match without disconnecting any time.
  useEffect(() => {
    if (keepsConnectionFromStart && currentTable && !isPositiveBigNumber(currentTable.matchId)) {
      setKeepsConnectionFromStart(false);
    }
  }, [currentTable, currentTable?.matchId, keepsConnectionFromStart]);

  const contextValue: InTableContextProps = {
    players,
    isHost,
    isConnectingToPeer,
    setIsConnectingToPeer,
    connectedToOpponent,
    keepsConnectionFromStart,
    setKeepsConnectionFromStart,
    peerConnectionTimedOut: isConnectingToPeer && peerReconnectionTime <= 0 && !opponentConnection?.open,
  };

  return <InTableContext.Provider value={contextValue}>{children}</InTableContext.Provider>;
};
