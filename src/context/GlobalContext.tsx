import React, { createContext, PropsWithChildren, useState } from 'react';
import { NormalRoomLevel } from '../constants';
// import { TableEntity } from '../api/entities.ts';
import AuthNavigator from '../navigations/AuthNavigator.tsx';
import { MysteryChineseChess } from '../contracts/typechain-types';

export interface GlobalContextProps {
  router?: typeof AuthNavigator;
  setRouter?: React.Dispatch<React.SetStateAction<typeof AuthNavigator>>;
  normalRoomLevel?: NormalRoomLevel;
  setNormalRoomLevel?: React.Dispatch<React.SetStateAction<NormalRoomLevel>>;
  table?: MysteryChineseChess.TableStruct;
  setTable?: React.Dispatch<React.SetStateAction<MysteryChineseChess.TableStruct>>;
}

export const GlobalContext = createContext<GlobalContextProps>({
});

export const GlobalContextProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [router, setRouter] = useState<typeof AuthNavigator>(AuthNavigator);
  const [normalRoomLevel, setNormalRoomLevel] = useState<NormalRoomLevel>();
  const [table, setTable] = useState<MysteryChineseChess.TableStruct>();
  const contextParams: GlobalContextProps = { router, setRouter, normalRoomLevel, setNormalRoomLevel, table, setTable };

  return (
    <GlobalContext.Provider value={contextParams}>{children}</GlobalContext.Provider>
  );
};
