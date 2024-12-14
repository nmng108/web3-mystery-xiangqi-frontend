import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { LOCAL_STORAGE_KEYS, UserInterfaceMatchState } from '../constants';
import { MatchSyncMessageInterface, P2PMessageType, SyncData } from '../p2pExchangeMessage';
import {
  computeRemainingTimeControls,
  getShortErrorMessage,
  isBlank,
  isEqual,
  isReliableMessage,
  isSameAddress,
  isZeroAddress,
  verifyAndMakeAllMoves,
} from '../utilities';
import { useAuthContext, useGlobalContext, useInTableContext, usePeerContext } from './index.ts';
import { MysteryChineseChess } from '../contracts/typechain-types';
import { verifyMessage } from 'ethers';
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
 * @param moves
 * @param setPauseReason
 * @param setMoves
 * @param setTimeControls
 * @param timeControls
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
      console.log('setHadSynchronizedBefore(true); (caused by keepsConnectionFromStart)');
    }
  }, [keepsConnectionFromStart, setUserInterfaceMatchState]);

  useEffect(() => {
    if (hasSynchronizedToPeer) {
      // not work properly as expected??
      console.log('entered game (caused by hasSynchronizedToPeer) before');
      setUserInterfaceMatchState(UserInterfaceMatchState.PLAYING);
      console.log('entered game (caused by hasSynchronizedToPeer) after');
      setPauseReason(null);
    } else {
      setUserInterfaceMatchState(UserInterfaceMatchState.PAUSED_DUE_TO_DISCONNECTION);
      console.log('pause game (caused by !hasSynchronizedToPeer)');
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
    } else if (!processor || timeControls.includes(null) || !moves) {
      setUserInterfaceMatchState(UserInterfaceMatchState.STARTING);
      setPauseReason('Preparing...');
    } else if (!opponentConnection || !connectedToOpponent) {
      setUserInterfaceMatchState(UserInterfaceMatchState.PAUSED_DUE_TO_DISCONNECTION);
      setPauseReason('Connecting to opponent...');
      console.log('Peer connection is lost or not yet opened. MatchState = PAUSED_DUE_TO_DISCONNECTION (5)');
      // console.log(opponentConnection);
      // } else if (opponentConnection?.open && hasSynchronizedToPeer) {
    } else {
      const syncRequiringStates = [
        UserInterfaceMatchState.STARTING,
        UserInterfaceMatchState.PAUSED,
        UserInterfaceMatchState.PAUSED_DUE_TO_DISCONNECTION,
      ];

      if (!syncRequiringStates.includes(userInterfaceMatchState)) return;

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

        return;
      }

      console.log('remain cases. conn status', connectedToOpponent);
      let backsToMatch: boolean = false;
      let hasStoredMoves: boolean = false;
      let finalMoveList: MysteryChineseChess.MoveStruct[] = moves;
      let finalComputedTimeControls: [number, number] = timeControls;

      // If just back to game, load & compute match data (if exists, which includes `move` and `timeControls`)
      // from local storage 1 time.
      if (!hasSynchronizedToPeer && !loadedStoredMoves.current) {
        console.log('Enter SYNC process');
        setPauseReason('Loading...');

        const storedMatchId: string = localStorage.getItem(LOCAL_STORAGE_KEYS.MATCH) as string;
        const storedMoves = JSON.parse(
          localStorage.getItem(LOCAL_STORAGE_KEYS.MOVES)
        ) as MysteryChineseChess.MoveStruct[];

        backsToMatch = !hadSynchronizedBefore && storedMatchId && isEqual(storedMatchId, match.id);
        hasStoredMoves = storedMoves?.length > 0;

        if (backsToMatch && hasStoredMoves) {
          finalMoveList = verifyAndMakeAllMoves(storedMoves, processor, match.players);
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
        setCurrentTurn(1 - Number(finalMoveList[finalMoveList.length - 1].details.playerIndex));
      }

      console.log('has sync?', hasSynchronizedToPeer);
      if (!hasSynchronizedToPeer && connectedToOpponent && isHost) {
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
  ]);

  useEffect(() => {
    const handleSyncMessage = (message: MatchSyncMessageInterface) => {
      // Filter to obtain exact message
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
            message.moves != null && moves.length > message.moves.length ? message.moves : moves;
          let maxVerifiedMoveLength: number = 0;

          for (let mvIdx = 0; mvIdx < masterMoveArray.length; mvIdx++) {
            const masterDetails: MysteryChineseChess.MoveDetailsStruct = masterMoveArray[mvIdx].details;

            if (mvIdx < remainMoveArray.length) {
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

            maxVerifiedMoveLength += 1;
          }

          const isSameMoveArray: boolean =
            maxVerifiedMoveLength == masterMoveArray.length && masterMoveArray.length == remainMoveArray.length;
          // Acceptable difference is less than 2s
          const isSameTimeControls: boolean =
            Math.abs(timeControls[0] - opponentData.timeControls[0]) < ALLOWED_TIME_CONTROL_DIFF &&
            Math.abs(timeControls[1] - opponentData.timeControls[1]) < ALLOWED_TIME_CONTROL_DIFF;

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
            const verifiedMoves: MysteryChineseChess.MoveStruct[] = masterMoveArray.slice(0, maxVerifiedMoveLength);
            let finalMoves: MysteryChineseChess.MoveStruct[] = moves;
            let computedRemainingTimeControls: [number, number] = timeControls;

            // Apply new moves
            if (moves.length != verifiedMoves.length) {
              processor.resetBoard();

              finalMoves = verifyAndMakeAllMoves(finalMoves, processor, match.players);
              computedRemainingTimeControls = computeRemainingTimeControls(
                finalMoves,
                match.timeControl,
                match.startTimestamp,
                Date.now()
              );

              setMoves(finalMoves);
              setTimeControls(computedRemainingTimeControls);
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

    if (opponentConnection && processor) {
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
