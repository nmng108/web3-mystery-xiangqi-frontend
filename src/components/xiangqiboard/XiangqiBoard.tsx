import React, { useCallback, useEffect, useState } from 'react';
import { IconButton, Typography } from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import { useAuthContext, useGlobalContext } from '../../hooks';
import { DefaultXiangqiProcessor, Position, XiangqiProcessor } from './XiangqiProcessor.ts';
import { Piece, PieceColor, pieceImageMappings } from '../../constants';
import { MysteryChineseChess } from '../../contracts/typechain-types';
import { isNonZeroAddress, isPositiveBigNumber, isSameAddress } from '../../utilities';
import { ContractError } from '../../contracts/abi';
import { PlayerTag } from '../gametable';
import CooldownClock from './CooldownClock.tsx';

const XiangqiBoard: React.FC = () => {
  const [match, setMatch] = useState<MysteryChineseChess.MatchStruct>();
  const [processor, setProcessor] = useState<XiangqiProcessor>();
  const [players, setPlayers] = useState<MysteryChineseChess.PlayerStruct[]>([null, null]);
  const [selectedPiece, setSelectedPiece] = useState<Position>();
  const [validMoves, setValidMoves] = useState<Position[]>([]);
  const [currentTurn, setCurrentTurn] = useState<number>(0); // allows only 0 or 1
  const { contract, user } = useAuthContext();
  const { currentTable, setFullscreenToastMessage } = useGlobalContext();

  const handleBackButton = useCallback(() => {
    // setTable(null);
  }, []);

  const handleClickPiecePosition = useCallback(
    (position: Position) => {
      const playerIndex = players.findIndex((player) =>
        isSameAddress(player.playerAddress, user.playerAddress)
      );
      const currentPieceColor: PieceColor =
        playerIndex != -1 ? PieceColor[PieceColor[playerIndex]] : PieceColor.NONE;

      if (processor?.getBoard()?.[position.y][position.x]?.color == currentPieceColor) {
        if (!selectedPiece || selectedPiece.x != position.x || selectedPiece.y != position.y) {
          setSelectedPiece(position);
          return;
        }
      }

      if (
        selectedPiece &&
        validMoves?.find((move) => move.x == position.x && move.y == position.y)
      ) {
        processor.move(selectedPiece, position);
        setCurrentTurn((prev) => 1 - prev);
      }

      setSelectedPiece(null);
    },
    [processor, user, players, selectedPiece, validMoves]
  );

  // Fetch match information
  useEffect(() => {
    if (contract && user && isPositiveBigNumber(currentTable?.matchId)) {
      (async function () {
        setMatch(await contract.getMatch(currentTable.matchId as never));
        console.log('fetch match data');
      })();
    }
  }, [contract, user, currentTable]);

  // Set player information to be rendered
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
  }, [contract, user, currentTable]);

  // Set isMyTurn. This logic may need to be complemented later
  // useEffect(() => {
  //   if (currentTable?.players) {
  //     setCurrentTurn(isSameAddress(currentTable.players[0], user.playerAddress));
  //   }
  // }, [currentTable?.players]);

  // Set processor
  useEffect(() => {
    if (contract && match) {
      setProcessor(new DefaultXiangqiProcessor(contract, match));
      console.log('set processor');
    } else {
      setProcessor(null);
      console.log('unset processor');
    }
  }, [contract, match]);

  // Set valid moves to be rendered
  useEffect(() => {
    if (selectedPiece && processor) {
      setValidMoves(processor.getValidMoves(selectedPiece));
      console.log('Set valid moves arr ', processor.getValidMoves(selectedPiece));
    } else {
      setValidMoves([]);
    }
  }, [selectedPiece, processor]);

  if (!currentTable || !isPositiveBigNumber(currentTable.matchId)) {
    return <div>Game hasn't been started</div>;
  }

  // console.log(processor.get2DArrayBoard()[2]);
  return (
    <div className="flex grow w-full md:w-5/6 lg:w-4/5 xl:w-3/4 2xl:w-[50rem] box-border border-4 border-amber-950 rounded-2xl mx-auto flex-col justify-stretch items-stretch space-y-2">
      <div className="relative w-full h-12 justify-self-start">
        <IconButton
          className="block absolute left-0 top-0 w-1/10 my-auto"
          onClick={handleBackButton}
        >
          <ArrowBackRoundedIcon />
        </IconButton>
        <Typography variant="h5" className="my-auto">
          {currentTable.name}
        </Typography>
      </div>
      <div className="flex grow py-2 flex-col justify-center items-center space-y-4">
        <div className="flex py-4 justify-center items-center space-x-6">
          <PlayerTag player={players[0]} isHost={currentTable.hostIndex == 0} />
          <CooldownClock
            initialMilliseconds={Number(currentTable.timeControl)}
            stopped={currentTurn != 0}
          />
        </div>
        <div className="flex grow flex-none w-full bg-gray-300 justify-center items-center">
          <div
            className="w-[40rem] h-[42.015263rem] bg-[url('https://d2g1zxtf4l76di.cloudfront.net/images/boards/Board.svg')] bg-no-repeat relative"
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
                            ${selectedPiece?.y == y && selectedPiece?.x == x && 'border-4 border-solid border-amber-400'}`}
                            style={{
                              boxShadow:
                                'rgba(0, 0, 0, 0.1) 4px 4px 5px, rgba(255, 255, 255, 0.3) 0px 4px 2px 0px inset, rgba(0, 0, 0, 0.3) 0px -3px 2px 0px inset',
                              backgroundColor: `${cell?.color == PieceColor.RED ? 'rgb(187,16,6)' : 'rgb(31,31,31)'}`,
                            }}
                          ></div>
                          <div className="w-1/2 h-1/2 absolute inset-[29%]">
                            {cell?.unfolded && (
                              <img src={pieceImageMappings.get(cell?.piece)} alt="piece" />
                            )}
                          </div>
                        </div>
                      )}
                      {selectedPiece && validMoves?.find((move) => move.x == x && move.y == y) && (
                        <div className="absolute w-[50%] h-[50%] rounded-full inset-[26%] translate-x-0 translate-y-0 opacity-1 bg-orange-300"></div>
                      )}
                    </div>
                  </>
                ))}
              </div>
            ))}
            <div className="flex w-full h-[5%]">
              {Array.from({ length: 10 }, (value, index) => index).map((col) => (
                <div className="w-[10%] h-full text-center">
                  <p>{col ? col : ''}</p>
                </div>
              ))}
            </div>
            {/*</div>*/}
          </div>
        </div>
        <div className="flex py-4 justify-center items-center space-x-6">
          <PlayerTag player={players[1]} isHost={currentTable.hostIndex == 1} />
          <CooldownClock
            initialMilliseconds={Number(currentTable.timeControl)}
            stopped={currentTurn != 1}
          />
        </div>
      </div>
    </div>
  );
};

export default XiangqiBoard;
