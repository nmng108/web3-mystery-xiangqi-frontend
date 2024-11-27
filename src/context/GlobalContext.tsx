import React, { createContext, ReactNode, useState } from 'react';
import { NormalRoomLevel } from '../constants';
import { TableEntity } from '../api/entities.ts';

export interface GlobalContextProps {
  normalRoomLevel?: NormalRoomLevel;
  setNormalRoomLevel?: React.Dispatch<React.SetStateAction<NormalRoomLevel | undefined>>;
  table?: TableEntity;
  setTable?: React.Dispatch<React.SetStateAction<TableEntity | undefined>>;
}

export const GlobalContext = createContext<GlobalContextProps>({
  // normalRoomLevel: undefined,
  // setNormalRoomLevel: undefined,
  // table: undefined,
  // setTable: undefined,
});

export const GlobalContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [normalRoomLevel, setNormalRoomLevel] = useState<NormalRoomLevel>();
  const [table, setTable] = useState<TableEntity>();
  const contextParams: GlobalContextProps = { normalRoomLevel, setNormalRoomLevel, table, setTable };

  return (
    <GlobalContext.Provider value={contextParams}>{children}</GlobalContext.Provider>
  );
};
