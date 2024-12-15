import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Backdrop, Divider, IconButton, Typography } from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import { useAuthContext, useGlobalContext, useInTableContext, usePeerContext } from '../../hooks';
import { Position, Web3MysteryXiangqiProcessor } from './processor';
import { LOCAL_STORAGE_KEYS, pieceImageMappings, UserInterfaceMatchState } from '../../constants';
import { MatchResultType, MatchStatus, Piece, PieceColor } from '../../contracts/abi';
import { MysteryChineseChess } from '../../contracts/typechain-types';
import {
  getShortErrorMessage,
  isBlank,
  isEqual,
  isNonZeroAddress,
  isPositiveBigNumber,
  isReliableMessage,
  isSameAddress,
} from '../../utilities';
import { PlayerTag } from '../gametable';
import CooldownClock from './CooldownClock.tsx';
import { MessageAndTimestamp, P2PExchangeMessageInterface, P2PMessageType } from '../../p2pExchangeMessage';
import { useSyncMatchData } from '../../hooks/useSyncMatchData';
import { type AddressLike, type BigNumberish } from 'ethers';
import WalletException from '../../exceptions/WalletException.ts';

type Props = {
  processor: Web3MysteryXiangqiProcessor;
  setProcessor: React.Dispatch<React.SetStateAction<Web3MysteryXiangqiProcessor>>;
  moves: MysteryChineseChess.MoveStruct[];
  setMoves: React.Dispatch<React.SetStateAction<MysteryChineseChess.MoveStruct[]>>;
};

const XiangqiBoard: React.FC<Props> = ({ processor, setProcessor, moves, setMoves }) => {
  const [match, setMatch] = useState<MysteryChineseChess.MatchStruct>();
  const [userInterfaceMatchState, setUserInterfaceMatchState] = useState<UserInterfaceMatchState>(
    UserInterfaceMatchState.NONE
  );
  const [timeControls, setTimeControls] = useState<[number, number]>([null, null]);
  const [selectedPiecePosition, setSelectedPiecePosition] = useState<Position>();
  const [validMoves, setValidMoves] = useState<Position[]>([]);
  const [currentTurn, setCurrentTurn] = useState<number>(0); // allows only 0 or 1
  const [pauseReason, setPauseReason] = useState<string>();
  const { signer, contract, user, setUserByPlayerStruct } = useAuthContext();
  const {
    currentTable,
    setCurrentTableByTableStruct,
    setFullscreenToastMessage,
    setWaitsForTransactionalActionMessage,
  } = useGlobalContext();
  const { peer, opponentConnection, connectOpponentPeerAddress } = usePeerContext();
  const { players, isHost, setIsConnectingToPeer, keepsConnectionFromStart, peerConnectionTimedOut } =
    useInTableContext();
  const { hasSynchronizedToPeer } = useSyncMatchData({
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
  });
  const playerIndex: number = useMemo(
    () =>
      currentTable ? currentTable.players.findIndex((addr) => user && isSameAddress(addr, user.playerAddress)) : -1,
    [user, currentTable]
  );
  const opponentIndex: number = useMemo(() => 1 - playerIndex, [playerIndex]);
  const opponentAddress = useMemo(
    () => currentTable?.players.find((addr) => user && !isSameAddress(addr, user.playerAddress)),
    [currentTable?.players, user]
  );
  const isMyTurn: boolean = useMemo(
    () => isSameAddress(currentTable?.players[currentTurn], user?.playerAddress),
    [currentTable?.players, currentTurn, user?.playerAddress]
  );
  const isJoiningMatch: boolean = useMemo(() => isPositiveBigNumber(currentTable?.matchId), [currentTable?.matchId]);
  const isInTableButNotJoiningMatch: boolean = useMemo(
    () => currentTable && !isPositiveBigNumber(currentTable.matchId),
    [currentTable]
  );
  const isNotInTable: boolean = useMemo(() => user && !isPositiveBigNumber(user.tableId), [user]);

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

  const handleBackButton = useCallback(async () => {
    if (!match) {
      setFullscreenToastMessage({ message: 'Match data is being loaded. Try again later.', level: 'error' });
      return;
    }

    try {
      setWaitsForTransactionalActionMessage('Exiting...');
      await contract.resignAndExitTable(match.id, moves);
      const handleExitedTable = async (playerAddress: AddressLike, tableId: BigNumberish) => {
        if (!isEqual(tableId, currentTable.id)) {
          return;
        }

        contract.off(contract.filters.ExitedTable, handleExitedTable);

        if (isSameAddress(playerAddress, user.playerAddress)) {
          console.log('exec exitttttt');
          // If this user had just exited a table
          // console.log("It's you who had exited");
          setCurrentTableByTableStruct(null);
          setUserByPlayerStruct({ ...user, tableId: 0 });
          setWaitsForTransactionalActionMessage(undefined);
          setFullscreenToastMessage({ message: 'Exited table', level: 'info' });
        } else {
          // TODO: implement listener for both players
          // console.log(players);
          // const oldOpponent: MysteryChineseChess.PlayerStruct = players.find((player) =>
          //   isSameAddress(player.playerAddress, playerAddress)
          // );
          //
          // setCurrentTableByTableStruct(await contract.getTable(tableId as never));
          // // console.log('should render notif for oppponent left');
          //
          // if (oldOpponent) {
          //   setFullscreenToastMessage({
          //     message: `${oldOpponent.playerName} has left`,
          //     level: 'info',
          //   });
          // }
        }

        if (opponentConnection) {
          connectOpponentPeerAddress(null);
          console.log('Closing peer connection to old opponent');
        }
      };

      contract.on(contract.filters.ExitedTable, handleExitedTable);
      // const resignData = { timestamp: Date.now() };

      opponentConnection.send({
        type: P2PMessageType.RESIGN,
        // data: resignData,
      } as P2PExchangeMessageInterface);
    } catch (err) {
      setFullscreenToastMessage({ message: getShortErrorMessage(err), level: 'error' });
      setWaitsForTransactionalActionMessage(undefined);
      throw err;
    }
  }, [
    connectOpponentPeerAddress,
    contract,
    currentTable?.id,
    match,
    moves,
    opponentConnection,
    setCurrentTableByTableStruct,
    setFullscreenToastMessage,
    setUserByPlayerStruct,
    setWaitsForTransactionalActionMessage,
    user,
  ]);

  const handleResignButton = useCallback(async () => {
    if (!match) {
      setFullscreenToastMessage({ message: 'Match data is being loaded. Try again later.', level: 'error' });
      return;
    }

    try {
      setWaitsForTransactionalActionMessage('Resigning...');
      await contract.resign(match.id, moves);

      opponentConnection.send({
        type: P2PMessageType.RESIGN,
        // data: resignData,
      } as P2PExchangeMessageInterface);
    } catch (err) {
      setFullscreenToastMessage({ message: getShortErrorMessage(err), level: 'error' });
      setWaitsForTransactionalActionMessage(undefined);
      throw err;
    }
  }, [contract, match, moves, opponentConnection, setFullscreenToastMessage, setWaitsForTransactionalActionMessage]);

  const handleClickPiecePosition = useCallback(
    async (position: Position) => {
      const currentPieceColor: PieceColor = playerIndex != -1 ? PieceColor[PieceColor[playerIndex]] : PieceColor.NONE;

      if (userInterfaceMatchState != UserInterfaceMatchState.PLAYING || !isMyTurn) {
        return;
      }

      // Select a piece
      if (processor?.getBoard()?.[position.y][position.x]?.color == currentPieceColor) {
        if (!selectedPiecePosition || selectedPiecePosition.x != position.x || selectedPiecePosition.y != position.y) {
          setSelectedPiecePosition(position);
          return;
        }
      }

      // Move selected piece to new selected position/cell
      if (selectedPiecePosition && validMoves?.find((move) => move.x == position.x && move.y == position.y)) {
        if (!opponentConnection?.open) {
          setUserInterfaceMatchState(UserInterfaceMatchState.PAUSED_DUE_TO_DISCONNECTION);
          setPauseReason('Disconnected. Waiting for reconnecting...');
          return;
        }

        setSelectedPiecePosition(null);

        // let movedPlayerPiece;
        let moveData: MysteryChineseChess.MoveStruct | null;

        // Validate & make selected move (if valid)
        try {
          moveData = await processor.moveAndSign(selectedPiecePosition, position);
          // movedPlayerPiece = processor.getBoard()[position.y][position.x];

          // movedPlayerPiece.unfold(false); // hide this until user sends message to his peer
          if (processor.hasWon(playerIndex)) {
            // Last move is not required to verify by peer but by contract
            try {
              await contract.verifyCheckmate(match.id, moves);
            } catch (err) {
              processor.revertLastMove();
              console.log(err);
              // throw err;
              throw new WalletException(err);
            }
          }
        } catch (err) {
          setFullscreenToastMessage({ message: getShortErrorMessage(err), level: 'error' });
          throw err;
        }

        // Send the move to opponent
        // const moveDataDetails: MysteryChineseChess.MoveDetailsStruct = {
        //   playerIndex: currentTurn,
        //   oldPosition: selectedPiecePosition,
        //   newPosition: position,
        //   timestamp: Date.now(),
        // };
        // const moveSignatures: [string, string] = [null, null];
        // moveSignatures[playerIndex] = await signer.signMessage(JSON.stringify(moveDataDetails)).catch((err) => {
        //   processor.revertLastMove();
        //   setFullscreenToastMessage({ message: getShortErrorMessage(err), level: 'error' });
        //   throw err;
        // });
        // // const moveData: MysteryChineseChess.MoveStruct = { details: moveDataDetails, signatures: moveSignatures };

        opponentConnection.send({
          type: P2PMessageType.MOVE,
          data: moveData,
          // signature: null, // the move is already signed and stored in the `data.details.moveSignatures` property
        } as P2PExchangeMessageInterface);

        // movedPlayerPiece.unfold();

        if (processor.hasWon(currentTurn)) {
          // contract.verifyCheckmate(match.id as never, moves);
          // setSelectedPiece(null);
          setFullscreenToastMessage({
            message: 'You won! Wait for server to verify your move.',
            level: 'info',
          });
          setUserInterfaceMatchState(UserInterfaceMatchState.ENDED);

          return;
        }

        setCurrentTurn((prev) => 1 - prev);
        setFullscreenToastMessage({
          message: 'Moved. Wait for opponent to verify your move.',
          level: 'info',
        });
      }

      setSelectedPiecePosition(null);
    },
    [
      playerIndex,
      userInterfaceMatchState,
      isMyTurn,
      processor,
      selectedPiecePosition,
      validMoves,
      opponentConnection,
      currentTurn,
      setFullscreenToastMessage,
      contract,
      match?.id,
      moves,
    ]
  );

  // Fetch match information
  useEffect(() => {
    if (contract && user && isPositiveBigNumber(currentTable?.matchId)) {
      (async function () {
        setMatch(await contract.getMatch(currentTable.matchId as never));
        console.log('fetched match data');
      })();
    }
  }, [contract, user, currentTable]);

  // Set up handler for data received from opponent peer
  useEffect(() => {
    const handleIncomingMessage = (message: P2PExchangeMessageInterface) => {
      // setMatchState(UserInterfaceMatchState.HANG_FOR_MOVE_VALIDATION_BY_PEER);
      // console.log('movee ', processor);

      if (message.type == P2PMessageType.MOVE) {
        (async function () {
          console.log("[MOVE] received opponent's message: ", message);
          const receivedMove: MysteryChineseChess.MoveStruct = message.data as MysteryChineseChess.MoveStruct;
          const moveDetails: MysteryChineseChess.MoveDetailsStruct = receivedMove.details;
          const opponentSignature: string = receivedMove.signatures[opponentIndex];

          if (Date.now() - Number(moveDetails.timestamp) > Number(match.timeControl)) {
            opponentConnection.send({
              type: P2PMessageType.INVALID_MESSAGE,
              data: { message: 'Invalid timestamp', timestamp: Date.now() } as MessageAndTimestamp,
              // signature: await signMessageAsync(response),
            } as P2PExchangeMessageInterface);
            // TODO: call contract to verify the winning of current player
            processor.revertLastMove();

            setFullscreenToastMessage({ message: 'Opponent just provided a invalid message', level: 'info' });
            return;
          }

          // let signedMoveData: MysteryChineseChess.MoveStruct;
          // Verify opponent's move and update the board if validated
          try {
            processor.move(moveDetails.oldPosition, moveDetails.newPosition);
          } catch (err) {
            setFullscreenToastMessage({ message: `Invalid move made by opponent: ${err.message}`, level: 'error' });
            opponentConnection.send({
              type: P2PMessageType.INVALID_MOVE,
              data: {
                timestamp: Date.now(),
                message: err.message,
              } as MessageAndTimestamp,
            } as P2PExchangeMessageInterface);
            // TODO: call contract to verify the winning of current player or require opponent to re-perform another move
            return;
          }

          // If opponent has won, you don't need to sign that message but let contract verify it.
          if (processor.hasWon(opponentIndex)) {
            // TODO: change to use another type of notification UI
            setFullscreenToastMessage({
              message: 'The game ended. Wait for verification result from contract...',
              level: 'info',
              duration: 10000,
            });
            setUserInterfaceMatchState(UserInterfaceMatchState.ENDED);
            // contract.verifyCheckmate(match.id as never, moves as never);
          } else if (
            isBlank(opponentSignature) ||
            !isReliableMessage(moveDetails, opponentSignature, opponentAddress)
          ) {
            opponentConnection.send({
              type: P2PMessageType.INVALID_SIGNATURE,
              data: { message: 'Signature is not verified', timestamp: Date.now() } as MessageAndTimestamp,
              // signature: await signMessageAsync(response),
            } as P2PExchangeMessageInterface);
            // TODO: call contract to verify the winning of current player
            processor.revertLastMove();

            setFullscreenToastMessage({ message: 'Opponent just provided a invalid signature', level: 'info' });
            return;
          } else {
            // Sign the received move and send back to opponent
            receivedMove.signatures[playerIndex] = await signMessageAsync(moveDetails).catch((err) => {
              setFullscreenToastMessage({ message: getShortErrorMessage(err), level: 'error' });
              opponentConnection.send({
                type: P2PMessageType.PAUSE_GAME,
                data: {
                  timestamp: Date.now(),
                  message: err.message,
                } as MessageAndTimestamp,
              } as P2PExchangeMessageInterface);

              throw new WalletException(err);
            });

            opponentConnection.send({
              type: P2PMessageType.MOVE_VALIDATED_BY_PEER,
              data: receivedMove,
            } as P2PExchangeMessageInterface);
          }

          setCurrentTurn((prev) => 1 - prev);
          setMoves((prev) => [...prev, receivedMove]);
        })();

        return;
      }

      if (message.type == P2PMessageType.MOVE_VALIDATED_BY_PEER) {
        console.log("[MOVE_VALIDATED_BY_PEER] received opponent's message: ", message);
        const moveData: MysteryChineseChess.MoveStruct = message.data as MysteryChineseChess.MoveStruct;
        const moveDataDetails: MysteryChineseChess.MoveDetailsStruct = moveData.details;
        const opponentSignature = moveData.signatures[opponentIndex];

        if (isBlank(opponentSignature) || !isReliableMessage(moveDataDetails, opponentSignature, opponentAddress)) {
          (async function () {
            const response = {
              message: 'Signature is not verified',
              timestamp: Date.now(),
            };

            opponentConnection.send({
              type: P2PMessageType.INVALID_SIGNATURE,
              data: response,
              signature: await signMessageAsync(response),
            } as P2PExchangeMessageInterface);
          })();

          // TODO: call contract to verify win result
          // contract.offerDraw(match.id as never).catch((err) => {
          //   setFullscreenToastMessage({ message: getShortErrorMessage(err), level: 'error' });
          //
          //   throw new WalletException(err);
          // });
          return;
        }

        // (Current turn has been switched to opponent before)
        // setMatchState(UserInterfaceMatchState.PLAYING);
        setMoves((prev) => [...prev, moveData]);
      }

      if (message.type == P2PMessageType.INVALID_SIGNATURE) {
        console.log("[INVALID_SIGNATURE] received opponent's message: ", message);
        // TODO: stop game & notify draw result
        setUserInterfaceMatchState(UserInterfaceMatchState.ENDED);
        setFullscreenToastMessage({
          message: 'You just made a invalid signature. This match was ended in a draw!',
          level: 'error',
          duration: 10000,
        });
      }

      if (
        [P2PMessageType.INVALID_MESSAGE, P2PMessageType.INVALID_SIGNATURE, P2PMessageType.INVALID_MOVE].includes(
          message.type
        )
      ) {
        console.log("[INVALID_MOVE] received opponent's message: ", message);
        // TODO: stop game & notify result
        setUserInterfaceMatchState(UserInterfaceMatchState.ENDED);
        setFullscreenToastMessage({
          message: 'You just made a invalid signature. You lose this match!',
          level: 'error',
          duration: 10000,
        });
      }
    };

    if (opponentConnection && processor) {
      opponentConnection.on('data', handleIncomingMessage);
    }

    return () => {
      if (opponentConnection) {
        opponentConnection.off('data', handleIncomingMessage);
        console.log('Remove data event handler from old opponent peer');
        console.log(opponentConnection);
      }
    };
  }, [
    contract,
    currentTable?.players,
    match?.id,
    match?.timeControl,
    moves,
    opponentAddress,
    opponentConnection,
    opponentIndex,
    playerIndex,
    processor,
    setFullscreenToastMessage,
    signMessageAsync,
    signer,
    user,
  ]);

  useEffect(() => {
    let handleMatchEnded: (_match: MysteryChineseChess.MatchStructOutput) => void;
    // TODO: remove this. 2 sides exchange draw offer directly, then sign to it and submit if the both approve.
    // let handleOfferingDraw: (matchId: BigNumberish, playerAddress: string) => void;
    // let handleApprovedDrawOffer: (matchId: BigNumberish, playerAddress: string) => void;
    // let handleDeclinedDrawOffer: (matchId: BigNumberish, playerAddress: string) => void;

    if (contract && match) {
      handleMatchEnded = async (_match) => {
        if (isEqual(_match.id, match.id)) {
          const duration: number = 5000;

          setMatch(_match);

          switch (Number(_match.matchResult.resultType)) {
            case MatchResultType.Checkmate | MatchResultType.Timeout: {
              const isWon: boolean = isEqual(_match.matchResult.winnerIndex, playerIndex);
              const message = isWon
                ? `You won! +${_match.matchResult.increasingElo} Elo`
                : `You lose! -${_match.matchResult.decreasingElo} Elo`;

              setMatch(null);
              setCurrentTableByTableStruct(await contract.getTable(user.tableId as never));
              setFullscreenToastMessage({ message: message, level: isWon ? 'success' : 'info', duration });
              return;
            }
            case MatchResultType.Resign: {
              const isWon: boolean = isEqual(_match.matchResult.winnerIndex, playerIndex);
              const message = isWon
                ? `Resign request had been verified. You won! +${_match.matchResult.increasingElo} Elo`
                : `Resign request had been verified. You lose! -${_match.matchResult.decreasingElo} Elo`;

              setCurrentTableByTableStruct(await contract.getTable(user.tableId as never));
              setFullscreenToastMessage({ message: message, level: isWon ? 'success' : 'info', duration });
              return;
            }
            case MatchResultType.OfferToDraw: {
              setFullscreenToastMessage({
                message: 'Match result verified! This game is a draw.',
                level: 'success',
                duration,
              });
              return;
            }
          }
        }
      };
      // handleOfferingDraw = async (matchId, playerAddress) => {
      //   if (isEqual(matchId, match.id)) {
      //     if (isSameAddress(user.playerAddress, playerAddress)) {
      //       setFullscreenToastMessage({message: 'Draw offer has been received by opponent. Wait for response', level: 'info'});
      //     } else {
      //       setFullscreenToastMessage({message: 'Opponent just offered a draw', level: 'info'});
      //
      //     }
      //   }
      // };
      // handleApprovedDrawOffer = async (matchId, playerAddress) => {
      //   if (isEqual(matchId, match.id) && !isSameAddress(user.playerAddress, playerAddress)) {
      //   }
      // };
      // handleDeclinedDrawOffer = async (matchId, playerAddress) => {
      //   if (isEqual(matchId, match.id) && !isSameAddress(user.playerAddress, playerAddress)) {
      //   }
      // };

      contract.on(contract.filters.MatchEnded, handleMatchEnded);
      // contract.on(contract.filters.OfferingDraw, handleOfferingDraw);
      // contract.on(contract.filters.ApprovedDrawOffer, handleApprovedDrawOffer);
      // contract.on(contract.filters.DeclinedDrawOffer, handleDeclinedDrawOffer);
    }

    return () => {
      if (contract) {
        contract.off(contract.filters.MatchEnded, handleMatchEnded);
        // contract.off(contract.filters.OfferingDraw, handleOfferingDraw);
        // contract.off(contract.filters.ApprovedDrawOffer, handleApprovedDrawOffer);
        // contract.off(contract.filters.DeclinedDrawOffer, handleDeclinedDrawOffer);
      }
    };
  }, [contract, match, playerIndex, setCurrentTableByTableStruct, setFullscreenToastMessage, user, user?.tableId]);

  // Set isMyTurn. This logic may need to be complemented later
  // useEffect(() => {
  //   if (currentTable?.players) {
  //     setCurrentTurn(isSameAddress(currentTable.players[0], user.playerAddress));
  //   }
  // }, [currentTable?.players]);

  // Set time controls
  useEffect(() => {
    if (match && timeControls.includes(null)) {
      // The accuracy of this values should not be a concern;
      // Actual values should be computed via the SYNC process (inside the `useSyncMatchData` hook)
      setTimeControls([Number(match.timeControl), Number(match.timeControl)]);
    }
  }, [match, timeControls]);

  // Set processor
  useEffect(() => {
    if (signer && contract && match && [0, 1].includes(playerIndex)) {
      setProcessor(new Web3MysteryXiangqiProcessor(contract, signer, match, playerIndex));
      console.log('set processor. Game started');
    } else {
      setProcessor(null);
      console.log('unset processor');
    }
  }, [contract, match, playerIndex, signer]);

  // Set valid moves to be rendered
  useEffect(() => {
    if (selectedPiecePosition && processor) {
      setValidMoves(processor.getValidMoves(selectedPiecePosition));
    } else {
      setValidMoves([]);
    }
  }, [selectedPiecePosition, processor]);

  // Countdown until leaving match after the match had ended.
  useEffect(() => {
    if (match && isEqual(match.matchStatus, MatchStatus.Ended)) {
      setTimeout(async () => {
        if (currentTable) {
          // If still being in table
          setCurrentTableByTableStruct(await contract.getTable(currentTable.id as never));
        }
      }, 2500);
    }
  }, [contract, currentTable, currentTable?.id, match, match?.matchStatus, setCurrentTableByTableStruct]);

  // Store current match data to storage for later lookup, specifically when user reloads page
  // Read by the `useSyncMatchData` hook
  useEffect(() => {
    if (isJoiningMatch && match) {
      localStorage.setItem(LOCAL_STORAGE_KEYS.MATCH, String(match.id));
    } else if (isNotInTable || isInTableButNotJoiningMatch) {
      localStorage.removeItem(LOCAL_STORAGE_KEYS.MATCH);
    }
  }, [isJoiningMatch, isInTableButNotJoiningMatch, isNotInTable, match]);

  // Store all moves of current match to storage for later lookup, specifically when user reloads page
  // Read by the `useSyncMatchData` hook
  useEffect(() => {
    if (isJoiningMatch && moves?.length > 0) {
      console.log('storing move list: ', moves);
      localStorage.setItem(LOCAL_STORAGE_KEYS.MOVES, JSON.stringify(moves));
    } else if (isNotInTable || isInTableButNotJoiningMatch) {
      localStorage.removeItem(LOCAL_STORAGE_KEYS.MOVES);
    }
  }, [isJoiningMatch, isInTableButNotJoiningMatch, isNotInTable, moves, moves?.length]);

  if (!currentTable || !isPositiveBigNumber(currentTable.matchId)) {
    return;
  }

  return (
    <div className="flex grow w-full md:w-5/6 lg:w-4/5 xl:w-3/4 2xl:w-[50rem] box-border border-solid border-4 border-amber-950 rounded-2xl mx-auto flex-col justify-stretch items-stretch space-y-2">
      <div className="relative w-full h-12 justify-self-start">
        <IconButton className="block absolute left-0 top-0 w-1/10 h-10 my-auto" onClick={handleBackButton}>
          <ArrowBackRoundedIcon />
        </IconButton>
        <div className="h-full my-auto text-center">
          <Typography variant="h5" className="text-center">
            {currentTable.name}
          </Typography>
        </div>
        <Divider className="top-12 w-full bg-black" />
      </div>
      <div className="flex grow flex-col justify-center items-center space-y-2">
        <div className="flex py-2 justify-center items-center space-x-6">
          <PlayerTag player={players[0]} isHost={currentTable.hostIndex == 0} />
          <CooldownClock
            timeLeft={timeControls[0]}
            setTimeLeft={(cb: (prev: number) => number) => setTimeControls([cb(timeControls[0]), timeControls[1]])}
            stopped={userInterfaceMatchState != UserInterfaceMatchState.PLAYING || currentTurn != 0}
          />
        </div>
        <div className="flex grow flex-none w-full py-4 bg-gray-300 justify-center items-center">
          <div
            className="w-[40rem] h-[42.015263rem] mr-8 bg-[url('https://d2g1zxtf4l76di.cloudfront.net/images/boards/Board.svg')] bg-no-repeat relative"
            style={{ backgroundSize: '80%', backgroundPosition: '75% 35%' }}
          >
            {/*<div className="w-full h-full">*/}
            {processor?.getBoard()?.map((row, y) => (
              <div key={y} className="flex w-full h-[9.5%]">
                {row.map((cell, x) => (
                  <>
                    {x == 0 && (
                      <div className="w-[10%] h-full text-center">
                        <p>{String.fromCharCode(65 + y)}</p>
                      </div>
                    )}
                    <div
                      className="relative w-[10%] h-full rounded-full"
                      onClick={() => handleClickPiecePosition({ y: y, x: x })}
                    >
                      {cell && cell.piece != Piece.None && (
                        <div
                          className="relative w-[90%] h-[90%] translate-x-0 translate-y-0 opacity-1"
                          draggable={true}
                        >
                          <div
                            className={`w-full h-full absolute inset-[5%] rounded-full box-border 
                            ${selectedPiecePosition?.y == y && selectedPiecePosition?.x == x && 'border-4 border-solid border-amber-400'}`}
                            style={{
                              boxShadow:
                                'rgba(0, 0, 0, 0.1) 4px 4px 5px, rgba(255, 255, 255, 0.3) 0px 4px 2px 0px inset, rgba(0, 0, 0, 0.3) 0px -3px 2px 0px inset',
                              backgroundColor: `${cell?.color == PieceColor.RED ? 'rgb(187,16,6)' : 'rgb(31,31,31)'}`,
                            }}
                          ></div>
                          <div className="w-1/2 h-1/2 absolute inset-[29%]">
                            {cell?.unfolded && <img src={pieceImageMappings.get(cell?.piece)} alt="piece" />}
                          </div>
                        </div>
                      )}
                      {selectedPiecePosition && validMoves?.find((move) => move.x == x && move.y == y) && (
                        <div className="absolute w-[50%] h-[50%] rounded-full inset-[26%] translate-x-0 translate-y-0 opacity-1 bg-orange-300"></div>
                      )}
                    </div>
                  </>
                ))}
              </div>
            ))}
            <div className="flex w-full h-[5%]">
              {Array.from({ length: 10 }, (value, index) => index).map((col) => (
                <div key={col} className="w-[10%] h-full text-center">
                  <p>{col ? col : ''}</p>
                </div>
              ))}
            </div>
            {/*</div>*/}
          </div>
        </div>
        <div className="flex py-2 justify-center items-center space-x-6">
          <PlayerTag player={players[1]} isHost={currentTable.hostIndex == 1} />
          <CooldownClock
            timeLeft={timeControls[1]}
            setTimeLeft={(cb: (prev: number) => number) => setTimeControls([timeControls[0], cb(timeControls[1])])}
            stopped={userInterfaceMatchState != UserInterfaceMatchState.PLAYING || currentTurn != 1}
          />
        </div>
      </div>
      <Backdrop sx={(theme) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })} open={!!pauseReason}>
        {pauseReason}
      </Backdrop>
    </div>
  );
};

export default XiangqiBoard;
