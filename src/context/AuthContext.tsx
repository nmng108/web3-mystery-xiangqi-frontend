import React, { createContext, ReactNode, useState } from 'react';

interface AuthContextProps {
  isAuthenticated: boolean;
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
}

export const AuthContext = createContext<AuthContextProps | undefined>(
  undefined,
);

export const AuthContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const authParams = { isAuthenticated, setIsAuthenticated };

  return (
    <AuthContext.Provider value={authParams}>{children}</AuthContext.Provider>
  );
};
