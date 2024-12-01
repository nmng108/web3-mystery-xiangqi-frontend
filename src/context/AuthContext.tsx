import React, { createContext, PropsWithChildren, useCallback, useEffect, useState } from 'react';
import { BrowserProvider, Contract, JsonRpcApiProvider, JsonRpcSigner } from 'ethers';
import { useGlobalContext, useWalletProviderContext } from '../hooks';
import { CONTRACT_ADDRESS } from '../contracts/abi';
import MysteryChineseChessABI from '../contracts/abi/MysteryChineseChess.json';
import { MysteryChineseChess } from '../contracts/typechain-types';
import MainNavigator from '../navigations/MainNavigator.tsx';
import AuthNavigator from '../navigations/AuthNavigator.tsx';

interface AuthContextProps {
  provider: JsonRpcApiProvider;
  setProvider: React.Dispatch<React.SetStateAction<JsonRpcApiProvider>>;
  contract: MysteryChineseChess;
  setContract: React.Dispatch<React.SetStateAction<MysteryChineseChess>>;
  signer: JsonRpcSigner;
  setSigner: React.Dispatch<React.SetStateAction<JsonRpcSigner>>;
  user: MysteryChineseChess.PlayerStruct;
  setUserByPlayerStruct: (userInfo: MysteryChineseChess.PlayerStruct) => void;
}

export const AuthContext = createContext<AuthContextProps | undefined>(
  undefined,
);

export const AuthContextProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [provider, setProvider] = useState<JsonRpcApiProvider>(null);
  const [signer, setSigner] = useState<JsonRpcSigner>(null);
  const [contract, setContract] = useState<MysteryChineseChess>(null);
  const [user, setUser] = useState<MysteryChineseChess.PlayerStruct>(null);
  const { selectedWallet, selectedAccount } = useWalletProviderContext();
  const { setRouter } = useGlobalContext();

  const setUserByPlayerStruct = useCallback((userInfo: MysteryChineseChess.PlayerStruct) => {
    if (!userInfo) {
      setUser(null);
    } else {
      setUser({
        playerAddress: userInfo.playerAddress,
        playerName: userInfo.playerName,
        elo: userInfo.elo,
        tableId: userInfo.tableId,
      } as MysteryChineseChess.PlayerStructOutput);
    }
  }, []);

  // (1) Set ethers.Provider
  useEffect(() => {
    if (selectedWallet) {
      setProvider(new BrowserProvider(selectedWallet.provider));
      // console.log('set Provider');
    } else {
      setProvider(null);
    }
  }, [selectedWallet]);

  // (2) Set ethers.Signer
  useEffect(() => {
    if (provider && selectedAccount) {
      (async function() {
        setSigner(await provider.getSigner(selectedAccount));
        // console.log('set Signer');
      })();
    } else {
      setSigner(null);
    }
  }, [provider, selectedAccount]);

  // (3) Set ethers.Contract
  useEffect(() => {
    if (signer) {
      setContract(new Contract(CONTRACT_ADDRESS, MysteryChineseChessABI.abi, signer) as unknown as MysteryChineseChess);
      // console.log('set Contract');
    } else {
      setContract(null);
    }
  }, [signer]);

  // (4) Set player information
  useEffect(() => {
    if (contract && selectedAccount) {
      (async function() {
        const userInfo = await contract.getPlayer(selectedAccount as never).catch((e) => {
          if (e.revert.name == 'ResourceNotFound') {
            return null;
          }
        });

        if (userInfo) {
          setUserByPlayerStruct(userInfo);
          console.log(userInfo);
          setRouter(MainNavigator);
        } else {
          setUser(null);

          await contract.on(contract.filters.NewPlayer, async (newPlayer) => {
            console.log('received NewPlayer event');
            console.log(newPlayer);
            setUserByPlayerStruct(newPlayer as MysteryChineseChess.PlayerStruct);
            await contract.removeAllListeners(contract.filters.NewPlayer);
          });
        }
      })();
    } else {
      setUser(null);
      setRouter(AuthNavigator);
    }
  }, [contract, selectedAccount, setUserByPlayerStruct, setRouter]);

  const authParams: AuthContextProps = {
    provider,
    setProvider,
    signer,
    setSigner,
    contract,
    setContract,
    user,
    setUserByPlayerStruct,
  };

  return (
    <AuthContext.Provider value={authParams}>{children}</AuthContext.Provider>
  );
};
