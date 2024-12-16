import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { LOCAL_STORAGE_KEYS, UserInterfaceMatchState } from '../constants';
import {
  MatchSyncMessageInterface,
  P2PExchangeMessageInterface,
  P2PMessageType,
  SyncData,
} from '../p2pExchangeMessage';
import {
  computeRemainingTimeControls,
  getShortErrorMessage,
  isEqual,
  isSameAddress,
  isZeroAddress,
  verifyAndMakeProvidedMoves,
} from '../utilities';
import { useAuthContext, useGlobalContext, useInTableContext, usePeerContext } from './index.ts';
import { MysteryChineseChess } from '../contracts/typechain-types';
import { Web3MysteryXiangqiProcessor } from '../components/xiangqiboard/processor';

const ALLOWED_TIME_CONTROL_DIFF: number = 2000; // ms

type Props = {
  // opponentConnection: DataConnection,
  // keepsConnectionFromStart: boolean;
  // isHost: boolean,
  userInterfaceMatchState: UserInterfaceMatchState;
  setUserInterfaceMatchState: React.Dispatch<React.SetStateAction<UserInterfaceMatchState>>;
  match: MysteryChineseChess.MatchStruct;
  setPauseReason: React.Dispatch<React.SetStateAction<string>>;
  moves: MysteryChineseChess.MoveStruct[];
  setMoves: React.Dispatch<React.SetStateAction<MysteryChineseChess.MoveStruct[]>>;
  timeControls: [number, number];
  setTimeControls: React.Dispatch<React.SetStateAction<[number, number]>>;
  setCurrentTurn: React.Dispatch<React.SetStateAction<number>>;
  processor: Web3MysteryXiangqiProcessor;
};

/**
 * ONLY used inside InTable context
 * @param userInterfaceMatchState
 * @param setUserInterfaceMatchState
 * @param match
 * @param setPauseReason
 * @param moves
 * @param setMoves
 * @param timeControls
 * @param setTimeControls
 * @param setCurrentTurn
 * @param processor
 */
const useSyncMatchData = ({
  userInterfaceMatchState,
  setUserInterfaceMatchState,
  match,
  setPauseReason,
  moves,
  setMoves,
  timeControls,
  setTimeControls,
  setCurrentTurn,
  processor,
}: Props) => {
  const [hadSynchronizedBefore, setHadSynchronizedBefore] = useState<boolean>(false);
  const [hasSynchronizedToPeer, setHasSynchronizedToPeer] = useState<boolean>(false);
  /**
   * True if the player (with specified index) notified the other one.
   */
  const [hasSentInitiatingMessages, setHasSentInitiatingMessages] = useState<[boolean, boolean]>([false, false]);
  /**
   * Only used for host.
   */
  const [hasSentFirstSYNCMessage, setHasSentFirstSYNCMessage] = useState<boolean>(false);
  const { signer, contract, user } = useAuthContext();
  const { currentTable, setFullscreenToastMessage } = useGlobalContext();
  const { peer, opponentConnection } = usePeerContext();
  const { players, isHost, keepsConnectionFromStart, peerConnectionTimedOut, connectedToOpponent } =
    useInTableContext();
  const loadedStoredMoves = useRef<boolean>(false);
  const opponentAddress = useMemo(
    () => currentTable?.players.find((addr) => user && !isSameAddress(addr, user.playerAddress)),
    [currentTable?.players, user]
  );
  const playerIndex: number = useMemo(
    () =>
      currentTable ? currentTable.players.findIndex((addr) => user && isSameAddress(addr, user.playerAddress)) : -1,
    [user, currentTable]
  );

  const signMessageAsync = useCallback(
    async (message: string | Uint8Array | object) => {
      return await signer
        .signMessage(typeof message == 'string' || message instanceof Uint8Array ? message : JSON.stringify(message))
        .catch((err) => {
          setFullscreenToastMessage({ message: getShortErrorMessage(err), level: 'error' });
          throw err;
        });
    },
    [setFullscreenToastMessage, signer]
  );

  /**
   * Do not sign message by default.
   */
  const sendSYNCMessage = useCallback(
    async (matchData: SyncData, signsData?: boolean, moves?: MysteryChineseChess.MoveStruct[]) => {
      const signature = !signsData
        ? undefined
        : await signMessageAsync(matchData).catch((err) => {
            setFullscreenToastMessage({ message: getShortErrorMessage(err), level: 'error' });
            throw err;
          });
      console.log('matchData: ', JSON.stringify(matchData));
      // console.log('keccak256 of stringified matchData:', keccak256(JSON.stringify(matchData)));
      console.log('signature: ', signature);
      opponentConnection.send({
        type: P2PMessageType.SYNC,
        data: matchData,
        signature: signature,
        moves: moves,
      } as MatchSyncMessageInterface);
    },
    [opponentConnection, setFullscreenToastMessage, signMessageAsync]
  );

  const sendSyncExceptionMessage = useCallback(async () => {
    if (!match) return;

    setPauseReason('Sync process has failed. Cannot continue this game.');
    await sendSYNCMessage({
      packetNum: -1,
      matchId: String(match.id),
      timestamp: Date.now(),
      hadSync: hadSynchronizedBefore,
      timeControls: null,
    });
  }, [hadSynchronizedBefore, match, sendSYNCMessage, setPauseReason]);

  useEffect(() => {
    if (keepsConnectionFromStart) {
      setHadSynchronizedBefore(true);
      // setHasSynchronizedToPeer(true);
      // setUserInterfaceMatchState(UserInterfaceMatchState.PLAYING);
    }
  }, [connectedToOpponent, keepsConnectionFromStart, opponentConnection, setUserInterfaceMatchState]);

  useEffect(() => {
    if (hasSynchronizedToPeer) {
      // not work properly as expected??
      setUserInterfaceMatchState(UserInterfaceMatchState.PLAYING);
      console.log('matchState = PLAYING (2) (caused by hasSynchronizedToPeer)');
      setPauseReason(null);
    } else {
      setUserInterfaceMatchState(UserInterfaceMatchState.PAUSED);
      console.log('matchState = PAUSED (caused by !hasSynchronizedToPeer)');
    }
  }, [hasSynchronizedToPeer, setPauseReason, setUserInterfaceMatchState]);

  useEffect(() => {
    console.log('UI match state: ', userInterfaceMatchState);
  }, [userInterfaceMatchState]);

  // Decide match state (including STARTING, PAUSED).
  // If you're a host of this table, this function is responsible for initiating the sync process
  // by sending to your opponent peer the first SYNC message.
  useEffect(() => {
    if (!match) {
      setUserInterfaceMatchState(UserInterfaceMatchState.NONE);
      setPauseReason('Loading...');
    } else if (!processor || timeControls.includes(null) || !moves) {
      setUserInterfaceMatchState(UserInterfaceMatchState.STARTING);
      setPauseReason('Preparing...');
    } else if (!hasSynchronizedToPeer) {
      console.log('remain cases. conn status', connectedToOpponent);
      let backsToMatch: boolean = false;
      let hasStoredMoves: boolean = false;
      let finalMoveList: MysteryChineseChess.MoveStruct[] = moves;
      let finalComputedTimeControls: [number, number] = timeControls;

      // If just back to game, load & compute match data (if exists, which includes `move` and `timeControls`)
      // from local storage 1 time.
      if (/*!hasSynchronizedToPeer && */ !loadedStoredMoves.current) {
        const storedMatchId: string = localStorage.getItem(LOCAL_STORAGE_KEYS.MATCH) as string;
        const storedMoves = JSON.parse(
          localStorage.getItem(LOCAL_STORAGE_KEYS.MOVES)
        ) as MysteryChineseChess.MoveStruct[];

        backsToMatch = !hadSynchronizedBefore && storedMatchId && isEqual(storedMatchId, match.id);
        hasStoredMoves = storedMoves?.length > 0;

        if (backsToMatch && hasStoredMoves) {
          finalMoveList = verifyAndMakeProvidedMoves(storedMoves, processor, match.players);
        }

        finalComputedTimeControls = computeRemainingTimeControls(
          finalMoveList,
          match.timeControl,
          match.startTimestamp,
          Date.now()
        );

        loadedStoredMoves.current = true;
      }

      if (backsToMatch && hasStoredMoves) {
        setMoves(finalMoveList);
        setTimeControls(finalComputedTimeControls);

        if (finalMoveList.length > 0) {
          setCurrentTurn(1 - Number(finalMoveList[finalMoveList.length - 1].details.playerIndex));
        }
      }

      // If not connected to opponent yet, stop the SYNC process
      if (!opponentConnection || !connectedToOpponent) {
        setUserInterfaceMatchState(UserInterfaceMatchState.PAUSED_DUE_TO_DISCONNECTION);
        setPauseReason('Connecting to opponent...');
        console.log('Peer connection is lost or not yet opened. MatchState = PAUSED_DUE_TO_DISCONNECTION (5)');
        // console.log(opponentConnection);
        // } else if (opponentConnection?.open && hasSynchronizedToPeer) {
        return;
      }

      const syncRequiringStates = [
        UserInterfaceMatchState.STARTING,
        UserInterfaceMatchState.PAUSED,
        UserInterfaceMatchState.PAUSED_DUE_TO_DISCONNECTION,
      ];

      if (!syncRequiringStates.includes(userInterfaceMatchState)) return;

      setPauseReason('Synchronizing...');

      if (opponentConnection.open && hasSentInitiatingMessages.filter((unchecked) => !unchecked).length > 0) {
        if (!hasSentInitiatingMessages[playerIndex]) {
          opponentConnection.send({
            type: P2PMessageType.ENTERED_MATCH,
          } as P2PExchangeMessageInterface);

          hasSentInitiatingMessages[playerIndex] = true;
          setHasSentInitiatingMessages([...hasSentInitiatingMessages]);
          console.log(
            'notified opponent! (wait until both of you notify each other about your existences, SYNC process will continue)'
          );
        } else {
          console.log('waiting for initiating message from opponent...');
        }

        return;
      }

      console.log('Enter SYNC process');
      // If a match is just started, host is in charge of sending this message (not require signature)
      if (keepsConnectionFromStart && isHost) {
        console.log('send first msg when starting');
        let totalTimeControl: number = Number(match.timeControl) - (Date.now() - Number(match.startTimestamp));
        totalTimeControl = totalTimeControl <= 0 ? 0 : totalTimeControl;

        sendSYNCMessage({
          packetNum: 0,
          matchId: String(match.id),
          timestamp: Date.now(),
          hadSync: hadSynchronizedBefore,
          timeControls: [totalTimeControl, totalTimeControl],
        });
        // setHasSentFirstSYNCMessage(true);

        return;
      }

      // If any of 2 players leaves and then enters match again, host is in charge of sending this message
      if (
        /*!hasSynchronizedToPeer && */ connectedToOpponent &&
        opponentConnection.open &&
        !hasSentFirstSYNCMessage &&
        isHost
      ) {
        // console.log('(host) ', {
        //   packetNum: 0,
        //   matchId: String(match.id),
        //   timestamp: Date.now(),
        //   hadSync: hadSynchronizedBefore,
        //   moves: backsToMatch && hasStoredMoves ? verifiedMoves : moves,
        //   timeControls: backsToMatch && hasStoredMoves ? computedTimeControls : timeControls,
        // });
        sendSYNCMessage(
          {
            packetNum: 0,
            matchId: String(match.id),
            timestamp: Date.now(),
            hadSync: hadSynchronizedBefore,
            timeControls: finalComputedTimeControls,
          },
          true,
          finalMoveList
        );
        setHasSentFirstSYNCMessage(true);
        console.log('setHasSentFirstSYNCMessage(true)');
      }
    }
  }, [
    hadSynchronizedBefore,
    hasSynchronizedToPeer,
    isHost,
    match,
    moves,
    opponentConnection,
    connectedToOpponent,
    processor,
    sendSYNCMessage,
    setMoves,
    setPauseReason,
    setTimeControls,
    setUserInterfaceMatchState,
    timeControls,
    userInterfaceMatchState,
    keepsConnectionFromStart,
    setCurrentTurn,
    hasSentFirstSYNCMessage,
    hasSentInitiatingMessages,
    playerIndex,
  ]);

  // Reset the SYNC process ONLY IF 2 players lost connection to each other.
  useEffect(() => {
    if (!connectedToOpponent || !opponentConnection || !opponentConnection.open) {
      setHasSentFirstSYNCMessage(false);
      setHasSentInitiatingMessages([false, false]);
    }
  }, [connectedToOpponent, opponentConnection]);

  // Handle SYNC and GAME_STARTED messages from peer
  useEffect(() => {
    const handleSyncMessage = (message: MatchSyncMessageInterface) => {
      if (message.type == P2PMessageType.ENTERED_MATCH) {
        hasSentInitiatingMessages[1 - playerIndex] = true; // check the slot of opponent

        setHasSentInitiatingMessages([...hasSentInitiatingMessages]);
        console.log('received init message.', hasSentInitiatingMessages);
        return;
      }

      // Filter to obtain only SYNC messages
      if (message.type != P2PMessageType.SYNC) return;

      // Filter to obtain exact message
      if (!match || isZeroAddress(opponentAddress)) {
        console.error('Match and opponent address should be assigned before executing this handler');
        return;
      }

      console.log("[SYNC] received opponent's message: ", message);

      const opponentData: SyncData = message.data;
      const opponentSignature = message.signature;

      if (!isEqual(match.id, opponentData.matchId)) {
        setFullscreenToastMessage({
          message: "Cannot synchronize with opponent's state. Reason: Invalid match ID from opponent's message.",
          level: 'error',
        });
        sendSyncExceptionMessage();
        console.log('err 00');

        return;
      }

      // Prevent user from continue playing and sending SYNC messages if any step of the sync process is invalid
      if (opponentData.packetNum == -1) {
        setFullscreenToastMessage({
          message: "Cannot synchronize with opponent's state.",
          level: 'error',
        });
        setPauseReason('Sync process has failed. Cannot continue this game.');
        console.error('err -1');
        // TODO: implement draw feature
        return;
      }

      // If 2 peers has connected to each other before the start of a match, the SYNC process will immediately be terminated
      // by sending 1 message back without signature from the non-host peer.
      if (keepsConnectionFromStart && opponentData.hadSync) {
        console.log('received SYNC message right after the game started');
        if (!isHost && opponentData.packetNum == 0) {
          sendSYNCMessage({
            packetNum: opponentData.packetNum + 1,
            matchId: String(match.id),
            timestamp: Date.now(),
            hadSync: hadSynchronizedBefore,
            timeControls: opponentData.timeControls,
          });

          setHasSynchronizedToPeer(true);
          setPauseReason(null);
          return;
        } else if (isHost && opponentData.packetNum == 1) {
          setHasSynchronizedToPeer(true);
          setPauseReason(null);
          return;
        }
      }

      // Validate packet number
      if (!(isHost && opponentData.packetNum == 1) && !(!isHost && [0, 2].includes(opponentData.packetNum))) {
        setFullscreenToastMessage({
          message: "Cannot synchronize with opponent's state.",
          level: 'error',
        });
        sendSyncExceptionMessage();
        console.log('err 02: ', opponentData.packetNum, isHost);

        return;
      }

      // Verify outer signature of the message
      // if (isBlank(opponentSignature) || !isReliableMessage(opponentData, opponentSignature, opponentAddress)) {
      //   const reason: string = isBlank(opponentSignature) ? 'Empty signature' : 'Unreliable message';
      //
      //   setFullscreenToastMessage({
      //     message: `Cannot synchronize with opponent's state. Reason: ${reason}.`,
      //     level: 'error',
      //   });
      //   setPauseReason('Sync process has failed. Cannot continue this game.');
      //   sendSyncExceptionMessage();
      //   console.error(
      //     'err 01. addr:',
      //     opponentAddress,
      //     'signed msg: %s ;',
      //     JSON.stringify(opponentData),
      //     'opponentSignature: %s ;',
      //     opponentSignature,
      //     '| sig->addr: ',
      //     /*opponentSignature,*/ verifyMessage(JSON.stringify(opponentData), opponentSignature)
      //   );
      //
      //   return;
      // }
      // console.log(
      //   'err 01. addr:',
      //   opponentAddress,
      //   'signed msg: %s ;',
      //   JSON.stringify(opponentData),
      //   'opponentSignature: %s ;',
      //   opponentSignature,
      //   '| sig->addr: ',
      //   /*opponentSignature,*/ verifyMessage(JSON.stringify(opponentData), opponentSignature)
      // );

      // With usual SYNC process, limit number of exchanged messages to 3
      (async function () {
        if (opponentData.packetNum < 2) {
          // Compare 2 `moves` array
          // Master array is the array that has its length less than the other.
          const masterMoveArray: MysteryChineseChess.MoveStruct[] =
            message.moves == null || moves.length > message.moves.length ? moves : message.moves;
          const remainMoveArray: MysteryChineseChess.MoveStruct[] =
            message.moves == null || moves.length > message.moves.length ? message.moves : moves;
          let maxIdenticalMovesLength: number = 0;

          for (let mvIdx = 0; mvIdx < masterMoveArray.length; mvIdx++) {
            const masterDetails: MysteryChineseChess.MoveDetailsStruct = masterMoveArray[mvIdx].details;

            if (remainMoveArray && mvIdx < remainMoveArray.length) {
              const remainDetails: MysteryChineseChess.MoveDetailsStruct = remainMoveArray[mvIdx].details;
              let isIdentical: boolean =
                isEqual(masterDetails.playerIndex, remainDetails.playerIndex) &&
                isEqual(masterDetails.timestamp, remainDetails.timestamp) &&
                masterDetails.oldPosition.x == remainDetails.oldPosition.x &&
                masterDetails.oldPosition.y == remainDetails.oldPosition.y &&
                masterDetails.newPosition.x == remainDetails.newPosition.x &&
                masterDetails.newPosition.y == remainDetails.newPosition.y;

              for (let sigIdx = 0; sigIdx < 2; sigIdx++) {
                if (masterMoveArray[mvIdx].signatures[sigIdx] !== remainMoveArray[mvIdx].signatures[sigIdx]) {
                  isIdentical = false;
                  console.log('not identical at', mvIdx);
                  break;
                }
              }

              if (!isIdentical) break;
            }

            // let isTrustable: boolean = true;

            //   if (
            //     !isReliableMessage(masterDetails, masterMoveArray[mvIdx].signatures[sigIdx], currentTable.players[sigIdx])
            //   ) {
            //     isTrustable = false;
            //     break;
            //   }

            // if (!isTrustable) break;

            maxIdenticalMovesLength += 1;
          }

          const isSameMoveArray: boolean =
            maxIdenticalMovesLength == masterMoveArray.length && masterMoveArray.length == remainMoveArray.length;
          // Acceptable difference is less than `ALLOWED_TIME_CONTROL_DIFF` milliseconds
          const isSameTimeControls: boolean =
            Math.abs(timeControls[0] - opponentData.timeControls[0]) < ALLOWED_TIME_CONTROL_DIFF &&
            Math.abs(timeControls[1] - opponentData.timeControls[1]) < ALLOWED_TIME_CONTROL_DIFF;

          /*if (isSameMoveArray && maxVerifiedMoveLength == 0) {
            // If both sides haven't made any moves, only sync time controls
            const remainingTimeControlOfRed: number = [];
            await sendSYNCMessage(
              {
                packetNum: opponentData.packetNum + 1,
                matchId: String(match.id),
                timestamp: Date.now(),
                hadSync: hadSynchronizedBefore,
                timeControls: opponentData.timeControls,
              },
              true,
              moves
            );
          } else*/
          if (isSameMoveArray && isSameTimeControls) {
            // set up local time controls with smaller values, and they usually belong to opponent's.
            setTimeControls(opponentData.timeControls);
            await sendSYNCMessage(
              {
                packetNum: opponentData.packetNum + 1,
                matchId: String(match.id),
                timestamp: Date.now(),
                hadSync: hadSynchronizedBefore,
                timeControls: opponentData.timeControls,
              },
              true,
              moves
            );
          } else {
            const identicalMoves: MysteryChineseChess.MoveStruct[] = masterMoveArray.slice(0, maxIdenticalMovesLength);
            let finalMoves: MysteryChineseChess.MoveStruct[] = moves;
            let computedRemainingTimeControls: [number, number] = timeControls;

            // Apply new moves
            if (moves.length != identicalMoves.length) {
              processor.resetBoard();

              finalMoves = verifyAndMakeProvidedMoves(identicalMoves, processor, match.players);
              computedRemainingTimeControls = computeRemainingTimeControls(
                finalMoves,
                match.timeControl,
                match.startTimestamp,
                Date.now()
              );

              setMoves(finalMoves);
              setTimeControls(computedRemainingTimeControls);

              if (finalMoves?.length > 0) {
                setCurrentTurn(1 - Number(finalMoves[finalMoves.length - 1].details.playerIndex));
              }
            }

            await sendSYNCMessage(
              {
                packetNum: opponentData.packetNum + 1,
                matchId: String(match.id),
                timestamp: Date.now(),
                hadSync: hadSynchronizedBefore,
                timeControls: computedRemainingTimeControls,
              },
              true,
              finalMoves
            );
          }
        }

        // Start game as the host send and his opponent receive the 3rd packet
        if ((isHost && opponentData.packetNum == 1) || (!isHost && opponentData.packetNum == 2)) {
          setHadSynchronizedBefore(true);
          setHasSynchronizedToPeer(true);
          // setUserInterfaceMatchState(UserInterfaceMatchState.PLAYING);
          setPauseReason(null);
        }
      })();
    };

    if (opponentConnection) {
      opponentConnection.on('data', handleSyncMessage);
    }

    return () => {
      if (opponentConnection) {
        opponentConnection.off('data', handleSyncMessage);
        // console.log('Remove data event handler (type: SYNC) from old opponent peer');
      }
    };
  }, [
    contract,
    currentTable?.players,
    hadSynchronizedBefore,
    isHost,
    match,
    match?.id,
    moves,
    opponentAddress,
    opponentConnection,
    opponentConnection?.open,
    playerIndex,
    processor,
    sendSyncExceptionMessage,
    sendSYNCMessage,
    setFullscreenToastMessage,
    setMoves,
    setPauseReason,
    setTimeControls,
    setUserInterfaceMatchState,
    signMessageAsync,
    signer,
    timeControls,
    user,
    keepsConnectionFromStart,
  ]);

  useEffect(() => {
    let handleCloseConnection: () => void;

    if (opponentConnection) {
      handleCloseConnection = () => {
        setHasSynchronizedToPeer(false);
        console.log('setHasSynchronizedToPeer(false)');
      };

      opponentConnection.on('close', handleCloseConnection);
    }

    return () => {
      opponentConnection?.off('close', handleCloseConnection);
    };
  }, [opponentConnection]);

  return { hasSynchronizedToPeer };
};

export { useSyncMatchData };
