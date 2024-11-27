import React, { createContext, ReactNode, useState } from 'react';
import { Player } from '../api/entities.ts';

interface AuthContextProps {
  isAuthenticated: boolean;
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
  user: Player;
  setUser: React.Dispatch<React.SetStateAction<Player>>;
}

export const AuthContext = createContext<AuthContextProps | undefined>(
  undefined
);

export const AuthContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<Player>(null);
  const authParams: AuthContextProps = {
    isAuthenticated, setIsAuthenticated, user, setUser
  };

  return (
    <AuthContext.Provider value={authParams}>{children}</AuthContext.Provider>
  );
};
