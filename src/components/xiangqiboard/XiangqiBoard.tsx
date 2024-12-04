import React, { useState } from 'react';
import { IconButton, Typography } from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import { useGlobalContext } from '../../hooks';
import PlayerTag from '../gametable/PlayerTag.tsx';
import { XiangqiProcessor, DefaultXiangqiProcessor, Position } from './XiangqiProcessor.ts';
import { PieceColor, pieceImageMappings } from '../../constants';

const XiangqiBoard: React.FC = () => {
  const [processor, setProcessor] = useState<XiangqiProcessor>(new DefaultXiangqiProcessor());
  const [selectedPiece, setSelectedPiece] = useState<Position>();
  const { normalRoomLevel, currentTable } = useGlobalContext();

  const handleBackButton = () => {
    // setTable(null);
  };

  const handleClickPiecePosition = (position: Position) => {
    if (processor.get2DArrayBoard()[position.y][position.x]) {
      setSelectedPiece(position);

      return;
    }

    if (selectedPiece != null) {
      processor.move(selectedPiece, position);
    }

    setSelectedPiece(null);
  };

  if (currentTable == null) {
    return (
      <div>Game hasn't been started</div>
    );
  }

  // console.log(processor.get2DArrayBoard()[2]);
  return (
    <div
      className="flex grow w-full md:w-5/6 lg:w-4/5 xl:w-3/4 2xl:w-[50rem] box-border border-4 border-amber-950 rounded-2xl mx-auto flex-col justify-stretch items-stretch space-y-2">
      <div className="relative w-full h-12 justify-self-start">
        <IconButton className="block absolute left-0 top-0 w-1/10 my-auto" onClick={handleBackButton}>
          <ArrowBackRoundedIcon />
        </IconButton>
        <Typography variant="h5" className="my-auto">{normalRoomLevel!.name.toUpperCase()} - {currentTable.name}</Typography>
      </div>
      <div className="flex grow py-2 flex-col justify-center items-center space-y-4">
        <div className="py-4">
          {/*<PlayerTag player={table.players[0]} isHost={table.hostIndex == 0} />*/}
        </div>
        <div className="flex grow flex-none w-full bg-gray-300 justify-center items-center">
          <div
            className="w-[40rem] h-[42.015263rem] bg-[url('https://d2g1zxtf4l76di.cloudfront.net/images/boards/Board.svg')] bg-no-repeat relative"
            style={{ backgroundSize: '80%', backgroundPosition: '75% 35%' }}
          >
            {/*<div className="w-full h-full">*/}
            {Array.from({ length: 10 }, (value, index) => index).map((row) => (
              <div className="flex w-full h-[9.5%]">
                {Array.from({ length: 9 }, (value, index) => index).map((col) => (
                  <>
                    {(col == 0) && (
                      <div className="w-[10%] h-full text-center">
                        <p>{String.fromCharCode(65 + row)}</p>
                      </div>
                    )}
                    <div className="w-[10%] h-full rounded-full"
                         onClick={() => handleClickPiecePosition({ y: row, x: col })}>
                      {processor.get2DArrayBoard()[row][col] && (
                        <div className="relative w-[90%] h-[90%] translate-x-0 translate-y-0 opacity-1"
                             draggable={true}
                        >
                          <div
                            className={`w-full h-full absolute inset-[5%] rounded-full box-border ${selectedPiece?.y == row && selectedPiece?.x == col && 'border-4 border-solid border-amber-400'}`}
                            style={{
                              boxShadow: 'rgba(0, 0, 0, 0.1) 4px 4px 5px, rgba(255, 255, 255, 0.3) 0px 4px 2px 0px inset, rgba(0, 0, 0, 0.3) 0px -3px 2px 0px inset',
                              backgroundColor: `${(processor.get2DArrayBoard()[row][col].color == PieceColor.RED) ? 'rgb(187,16,6)' : 'rgb(31,31,31)'}`,
                            }}
                          ></div>
                          <div className="w-1/2 h-1/2 absolute inset-[29%]">
                            {processor.get2DArrayBoard()[row][col].unfolded && (
                              <img src={pieceImageMappings.get(processor.get2DArrayBoard()[row][col].piece)}
                                   alt="piece" />
                            )}
                          </div>
                        </div>
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
        <div className="py-4">
          {/*<PlayerTag player={table.players[1]} isHost={table.hostIndex == 1} />*/}
        </div>
      </div>
    </div>
  );
};

export default XiangqiBoard;