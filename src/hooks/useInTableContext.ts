import { useContext, useEffect, useMemo, useState } from 'react';
import { type BaseConnectionErrorType, type DataConnectionErrorType, PeerError, type PeerErrorType } from 'peerjs';
import { useAuthContext, useGlobalContext, usePeerContext } from './index.ts';
import { isNonZeroAddress, isSameAddress } from '../utilities';
import { InTableContext } from '../context';

/**
 * This hook should be used only in Table components.
 */
const useInTableContext = () => useContext(InTableContext);

export default useInTableContext;
// export const useInTableContext: useInTableConnection = ({ isConnecting, setIsConnecting }) => {
//   const [connectionEstablishmentTime, setConnectionEstablishmentTime] = useState<number>(null);
//   const { currentTable } = useGlobalContext();
//   const { user } = useAuthContext();
//   const { peer, opponentConnection, connectOpponentPeerAddress } = usePeerContext();
//   const isHost = useMemo(
//     () => isSameAddress(currentTable.players[Number(currentTable.hostIndex)], user.playerAddress),
//     [currentTable?.players, currentTable?.hostIndex, user?.playerAddress]
//   );
//
//   useEffect(() => {
//     setConnectionEstablishmentTime(isConnecting ? MAX_CONNECTION_ESTABLISHMENT_TIME : null);
//   }, [isConnecting]);
//
//   // Set up handler for error 'peer-unavailable'
//   useEffect(() => {
//     const handleError = (error: PeerError<`${PeerErrorType}`>) => {
//       // try to reconnect to opponent peer every 3s
//       if (error.type == 'peer-unavailable') {
//         if (isHost && peer && opponentConnection && !opponentConnection.open) {
//           setTimeout(() => {
//             if (connectionEstablishmentTime > 0 && peer?.open && opponentConnection && !opponentConnection.open) {
//               connectOpponentPeerAddress(opponentConnection.peer);
//               console.log(`(every 2s) Reconnecting to peer (ID=${opponentConnection.peer} ... (Reason: peer-unavailable)`);
//             }
//           }, RECONNECT_DELAY);
//           // setTimeout(() => {
//           //   // connectOpponentPeerAddress(opponentConnection.peer);
//           //   setOpponentConnectionRetries((prev) => prev + 1);
//           //   // console.log(`(every 2s) Reconnecting to peer with ID %s ...`, opponentConnection.peer);
//           // }, 2000);
//         }
//       }
//     };
//
//     peer?.on('error', handleError);
//
//     return () => {
//       peer?.off('error', handleError);
//     };
//   }, [peer, peer?.open, opponentConnection, connectOpponentPeerAddress, isHost, connectionEstablishmentTime]);
//
//   useEffect(() => {
//     let handleOpen: () => void;
//     let handleClose: () => void;
//     let handleError: (error: PeerError<`${BaseConnectionErrorType | DataConnectionErrorType}`>) => void;
//
//     if (opponentConnection) {
//       handleOpen = () => {
//         setIsConnecting(false);
//       };
//       handleClose = () => {
//         // If the disconnection is caused by player exits table/match, do not try to reconnect
//         if (!currentTable || currentTable.players.filter(isNonZeroAddress).length == 1) {
//           return;
//         }
//
//         setIsConnecting(true);
//         if (isHost) {
//           setTimeout(() => {
//             if (connectionEstablishmentTime > 0 && peer?.open && opponentConnection && !opponentConnection.open) {
//               connectOpponentPeerAddress(opponentConnection.peer);
//               console.log(`(every 2s) Reconnecting to peer (ID=${opponentConnection.peer} ... (Reason: connection closed)`);
//             }
//           }, RECONNECT_DELAY);
//         }
//       };
//       handleError = () => {
//         setIsConnecting(true);
//         if (isHost) {
//           setTimeout(() => {
//             if (connectionEstablishmentTime > 0 && peer?.open && opponentConnection && !opponentConnection.open) {
//               connectOpponentPeerAddress(opponentConnection.peer);
//               console.log(`(every 2s) Reconnecting to peer (ID=${opponentConnection.peer} ... (Reason: connection error)`);
//             }
//           }, RECONNECT_DELAY);
//         }
//       };
//
//       opponentConnection.on('open', handleOpen);
//       opponentConnection.on('close', handleClose);
//       opponentConnection.on('error', handleError);
//     }
//
//     return () => {
//       opponentConnection?.off('open', handleOpen);
//       opponentConnection?.off('close', handleClose);
//       opponentConnection?.off('error', handleError);
//     };
//   }, [
//     connectOpponentPeerAddress,
//     connectionEstablishmentTime,
//     currentTable,
//     isHost,
//     opponentConnection,
//     peer?.open,
//     setIsConnecting,
//   ]);
//
//   useEffect(() => {
//     if (connectionEstablishmentTime > 0) {
//       const oneSecond: number = 1000;
//
//       setTimeout(() => {
//         if (connectionEstablishmentTime > 0) {
//           setConnectionEstablishmentTime((prev) => prev - oneSecond);
//         }
//       }, oneSecond);
//     }
//   }, [connectionEstablishmentTime]);
//
//   // (Re)connect to opponent in case 2 players lost connection to each other (due to any reason)
//   // Note: ONLY host sends offer for peer connection establishment
//   useEffect(() => {
//     if (
//       isHost &&
//       currentTable.players.filter(isNonZeroAddress).length == 2 &&
//       peer?.open && // Requires connection to peer server
//       !opponentConnection?.open &&
//       !isConnecting
//     ) {
//       const opponentAddress = currentTable.players.find((addr) => !isSameAddress(addr, user.playerAddress));
//
//       if (isNonZeroAddress(opponentAddress)) {
//         connectOpponentPeerAddress(opponentAddress);
//         setIsConnecting(true);
//         console.log(`Connecting to opponent (ID=${opponentAddress} ...`);
//       }
//     }
//   }, [
//     currentTable.players,
//     user,
//     peer?.open,
//     opponentConnection?.open,
//     connectOpponentPeerAddress,
//     isHost,
//     isConnecting,
//     setIsConnecting,
//   ]);
//
//   return {
//     peerConnectionTimedOut: isConnecting && connectionEstablishmentTime <= 0 && !opponentConnection?.open,
//   };
// };
