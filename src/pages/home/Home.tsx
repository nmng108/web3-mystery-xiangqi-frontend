import { PageContainer } from '../../components';
import React, { useCallback, useState } from 'react';
import { Button, ButtonGroup } from '@mui/material';
import BotModeSelector from './BotModeSelector.tsx';
import NormalModeLobby from './NormalModeLobby.tsx';

enum GameMode {
  BOT,
  NORMAL,
  RANK
}

enum NormalMode {
  PVP,
  BOT
}

const Home: React.FC = () => {
  const [activeMode, setActiveMode] = useState<GameMode>(GameMode.NORMAL);
  const [inTable, setInTable] = useState<boolean>(false);

  const handleEnterTable = useCallback(() => {
    setInTable(true);
  }, []);

  const TableSelector: () => (React.JSX.Element | null) = useCallback(() => {
    switch (activeMode) {
      case GameMode.BOT:
        return <BotModeSelector />;
      case GameMode.NORMAL:
        return <NormalModeLobby />;
      case GameMode.RANK:
        return (
          <>
            Rank
          </>
        );
      default:
        return null;
    }
  }, [activeMode]);

  return (
    <PageContainer>
      <div className="grid grid-rows-[4rem_1rem_4rem_2rem_6rem_minmax(40rem,_1fr)] gap-4">
        {/* Game Mode Selector */}
        <div className="flex row-start-3 col-span-full justify-center items-center">
          <ButtonGroup variant="outlined" className="flex w-1/2 min-h-min h-full rounded-2xl items-stretch">
            <Button
              variant={(activeMode === GameMode.BOT) ? 'contained' : 'outlined'}
              className={`block flex-1 font-semibold`}
              onClick={() => setActiveMode(GameMode.BOT)}
            >
              Bot
            </Button>
            <Button
              variant={(activeMode === GameMode.NORMAL) ? 'contained' : 'outlined'}
              className={`block flex-1 font-semibold`}
              onClick={() => setActiveMode(GameMode.NORMAL)}
            >
              Normal
            </Button>
            <Button
              variant={(activeMode === GameMode.RANK) ? 'contained' : 'outlined'}
              className={`block flex-1 font-semibold`}
              onClick={() => setActiveMode(GameMode.RANK)}
            >
              Rank
            </Button>
          </ButtonGroup>
        </div>
        {/* Search */}
        {(activeMode !== GameMode.BOT) ? (
          <div className="flex row-start-5 col-span-full justify-center items-center">
            <div className="flex space-x-20">
              <Button variant="contained" color="info" className="bg-white text-black px-4 py-2 rounded">
                Join randomly
              </Button>
              <Button variant="contained" color="info" className="bg-white text-black px-4 py-2 rounded">
                Create table
              </Button>
            </div>
          </div>
        ) : null}
        {/* Room Options */}
        <div
          className="flex row-start-6 col-span-full box-border w-full md:w-5/6 lg:w-2/3 xl:w-7/12 2xl:w-5/12 border-4 border-amber-950 rounded-2xl mx-auto flex-col justify-stretch items-stretch space-y-2">
          {(activeMode !== GameMode.BOT) ? (
            <div className="grid grid-cols-1 md:grid-cols-2">
              <Button variant="contained" color="info" className="w-1/3 px-2 py-1">Reload</Button>
              <div className="flex md:col-start-2 justify-end space-x-2">
                <input
                  type="text"
                  placeholder="Find table..."
                  className="px-2 py-1 rounded bg-gray-200 text-black"
                />
                <Button variant="contained" color="info" className="px-4 py-1">Enter</Button>
              </div>
            </div>
          ) : null}

          <TableSelector />
        </div>
      </div>
    </PageContainer>
  )
    ;
};

export default Home;
