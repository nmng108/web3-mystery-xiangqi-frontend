import React, { createContext, PropsWithChildren, useCallback, useEffect, useState } from 'react';
import { LOCAL_STORAGE_KEYS, NormalRoomLevel } from '../constants';
// import { TableEntity } from '../api/entities.ts';
import AuthNavigator from '../navigations/AuthNavigator.tsx';
import { MysteryChineseChess } from '../contracts/typechain-types';
import MainNavigator from '../navigations/MainNavigator.tsx';
import { createBrowserRouter } from 'react-router-dom';

type ToastMessage = {
  message: string;
  level: 'success' | 'info' | 'warning' | 'error';
  duration?: number;
};

interface GlobalContextProps {
  router: typeof AuthNavigator;
  setRouter: React.Dispatch<React.SetStateAction<typeof AuthNavigator>>;
  normalRoomLevel: NormalRoomLevel;
  setNormalRoomLevel: React.Dispatch<React.SetStateAction<NormalRoomLevel>>;
  currentTable: MysteryChineseChess.TableStruct;
  setCurrentTableByTableStruct: (tableStruct: MysteryChineseChess.TableStruct) => void;
  fullscreenToastMessage: ToastMessage;
  setFullscreenToastMessage: React.Dispatch<React.SetStateAction<ToastMessage>>;
  waitsForTransactionalActionMessage: string;
  setWaitsForTransactionalActionMessage: React.Dispatch<React.SetStateAction<string>>;
}

export const GlobalContext = createContext<GlobalContextProps>(undefined);

export const GlobalContextProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [router, setRouter] = useState<typeof AuthNavigator>(MainNavigator);
  const [normalRoomLevel, setNormalRoomLevel] = useState<NormalRoomLevel>();
  const [currentTable, setCurrentTable] = useState<MysteryChineseChess.TableStruct>();
  const [fullscreenToastMessage, setFullscreenToastMessage] = useState<ToastMessage>();
  const [waitsForTransactionalActionMessage, setWaitsForTransactionalActionMessage] = useState<string>();

  const setCurrentTableByTableStruct = useCallback((tableStruct: MysteryChineseChess.TableStruct) => {
    if (tableStruct) {
      setCurrentTable({
        id: tableStruct.id,
        name: tableStruct.name,
        gameMode: tableStruct.gameMode,
        players: tableStruct.players,
        hostIndex: tableStruct.hostIndex,
        timeControl: tableStruct.timeControl,
        stake: tableStruct.stake,
        matchId: tableStruct.matchId,
      });
    } else {
      setCurrentTable(null);
    }
  }, []);

  const contextParams: GlobalContextProps = {
    router,
    setRouter,
    normalRoomLevel,
    setNormalRoomLevel,
    currentTable,
    setCurrentTableByTableStruct,
    fullscreenToastMessage,
    setFullscreenToastMessage,
    waitsForTransactionalActionMessage,
    setWaitsForTransactionalActionMessage,
  };

  useEffect(() => {
    const localUserInfo: MysteryChineseChess.PlayerStruct = localStorage.getItem(LOCAL_STORAGE_KEYS.USER) as never;

    console.log('In Global context: ' + (localUserInfo ? 'read user info' : 'not found user info'));
    setRouter(localUserInfo ? MainNavigator : AuthNavigator);
  }, []);

  return <GlobalContext.Provider value={contextParams}>{children}</GlobalContext.Provider>;
};
