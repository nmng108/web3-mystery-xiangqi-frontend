import { PageContainer } from '../../components';
import React, { useCallback, useState } from 'react';
import { Button, ButtonGroup } from '@mui/material';
import BotModeSelector from './BotModeSelector.tsx';
import NormalModeLobby from '../../components/lobby/NormalModeLobby.tsx';
import useGlobalContext from '../../hooks/useGlobalContext.ts';
import GameTable from '../../components/gametable/GameTable.tsx';
import { XiangqiBoard } from '../../components/xiangqiboard';
import RankModeLobby from '../../components/lobby/RankModeLobby.tsx';

enum GameMode {
  BOT,
  NORMAL,
  RANK
}


const Home: React.FC = () => {
  const [activeMode, setActiveMode] = useState<GameMode>(GameMode.NORMAL);
  const { table, normalRoomLevel } = useGlobalContext();

  // const handleEnterTable = useCallback(() => {
  //   setInTable(true);
  // }, [setInTable]);

  const TableSelector: () => (React.JSX.Element | null) = useCallback(() => {
    switch (activeMode) {
      case GameMode.BOT:
        return <BotModeSelector />;
      case GameMode.NORMAL:
        return <NormalModeLobby />;
      case GameMode.RANK:
        return (
          <>
            <RankModeLobby />
          </>
        );
      default:
        return null;
    }
  }, [activeMode]);

  return (
    <PageContainer>
      <div className="flex h-full flex-col space-y-4">
        <div className="h-16"></div>
        {/* Game Mode Selector */}
        <div className="flex h-8 xl:h-12 2xl:h-16 justify-center items-center">
          {!table && (
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
          )}
        </div>
        {/* Search */}
        {!table?.matchId && ( // remove this element while in game
          <div className="flex h-8 xl:h-12 2xl:h-16 justify-center items-center">
            {((activeMode == GameMode.NORMAL && normalRoomLevel && !table) || activeMode == GameMode.RANK) && (
              <div className="flex space-x-20">
                <Button variant="contained" color="info" className="bg-white text-black px-4 py-2 rounded">
                  Join randomly
                </Button>
                <Button variant="contained" color="info" className="bg-white text-black px-4 py-2 rounded">
                  Create table
                </Button>
              </div>
            )}
          </div>
        )}
        {/* Room Options */}
        {(table?.matchId == undefined || table.matchId == 0) && ( // remove this element while in game
          <div
            className="flex grow w-full md:w-5/6 lg:w-4/5 xl:w-3/4 2xl:w-[50rem] box-border border-4 border-amber-950 rounded-2xl mx-auto flex-col justify-stretch items-stretch space-y-2">
            <div className="flex h-8 justify-between">
              {((activeMode == GameMode.NORMAL && normalRoomLevel && !table) || activeMode == GameMode.RANK) && (
                <>
                  <Button variant="contained" color="info" className="w-1/3 px-2 py-1">Reload</Button>
                  <div className="flex md:col-start-2 justify-end space-x-2">
                    <input
                      type="text"
                      placeholder="Find table..."
                      className="px-2 py-1 rounded bg-gray-200 text-black"
                    />
                    <Button variant="contained" color="info" className="px-4 py-1">Enter</Button>
                  </div>
                </>
              )}
            </div>

            {!table && (
              <TableSelector />
            )}
            {(table && !(table.matchId)) && (
              <GameTable />
            )}
          </div>
        )}

        {(table && (table.matchId != undefined && table.matchId != 0)) && (
          <XiangqiBoard />
        )}
      </div>
    </PageContainer>
  );
};

export default Home;
