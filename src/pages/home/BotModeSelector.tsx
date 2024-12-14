import React, { useState } from 'react';
import { Button } from '@mui/material';
import { PieceColor } from '../../contracts/abi';

enum BotLevel {
  EASY,
  MEDIUM,
  HARD,
}

type Props = unknown;

const BotModeSelector: React.FC<Props> = () => {
  const [color, setColor] = useState<PieceColor>(PieceColor.RED);
  const [level, setLevel] = useState<BotLevel>(BotLevel.EASY);

  return (
    <div className="flex grow border-2 border-solid border-black rounded-2xl flex-col text-blue-950">
      <div className="flex justify-around items-center">
        <span>Color: </span>
        <Button
          variant={color === PieceColor.RED ? 'contained' : 'outlined'}
          color="info"
          onClick={() => setColor(PieceColor.RED)}
        >
          <span className="font-semibold text-lg">Red</span>
        </Button>
        <Button
          variant={color === PieceColor.BLACK ? 'contained' : 'outlined'}
          color="info"
          onClick={() => setColor(PieceColor.BLACK)}
        >
          <span className="font-semibold text-lg">Black</span>
        </Button>
      </div>
      <div className="flex justify-around items-center">
        <span>Level: </span>
        {[BotLevel.EASY, BotLevel.MEDIUM, BotLevel.HARD].map((l) => (
          <Button variant={level === l ? 'contained' : 'outlined'} color="info" onClick={() => setLevel(l)}>
            <span className="font-semibold text-lg">{BotLevel[l]}</span>
          </Button>
        ))}
      </div>
      <Button variant="outlined" color="info">
        <span className="font-semibold text-lg">Start</span>
      </Button>
    </div>
  );
};

export default BotModeSelector;
