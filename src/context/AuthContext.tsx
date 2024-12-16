import React, { createContext, PropsWithChildren, useCallback, useEffect, useState } from 'react';
import { BrowserProvider, Contract, JsonRpcApiProvider, JsonRpcSigner } from 'ethers';
import { useGlobalContext, useWalletProviderContext } from '../hooks';
import { CONTRACT_ADDRESS } from '../env';
import { ContractError } from '../contracts/abi';
import MysteryChineseChessABI from '../contracts/abi/MysteryChineseChess.json';
import { MysteryChineseChess } from '../contracts/typechain-types';
import MainNavigator from '../navigations/MainNavigator.tsx';
import AuthNavigator from '../navigations/AuthNavigator.tsx';
import { LOCAL_STORAGE_KEYS } from '../constants';
import { isSameAddress } from '../utilities';

type ExceptionMessage = {
  message: string;
  level: 'success' | 'info' | 'warning' | 'error';
  duration?: number;
};

interface AuthContextProps {
  provider: JsonRpcApiProvider;
  setProvider: React.Dispatch<React.SetStateAction<JsonRpcApiProvider>>;
  contract: MysteryChineseChess;
  setContract: React.Dispatch<React.SetStateAction<MysteryChineseChess>>;
  signer: JsonRpcSigner;
  setSigner: React.Dispatch<React.SetStateAction<JsonRpcSigner>>;
  user: MysteryChineseChess.PlayerStruct;
  setUserByPlayerStruct: (userInfo: MysteryChineseChess.PlayerStruct) => void;
  authMessage: ExceptionMessage;
  setAuthMessage: React.Dispatch<React.SetStateAction<ExceptionMessage>>;
}

export const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthContextProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [provider, setProvider] = useState<JsonRpcApiProvider>(null);
  const [signer, setSigner] = useState<JsonRpcSigner>(null);
  const [contract, setContract] = useState<MysteryChineseChess>(null);
  const [user, setUser] = useState<MysteryChineseChess.PlayerStruct>(null);
  const [authMessage, setAuthMessage] = useState<ExceptionMessage>();
  const { selectedWallet, selectedAccount, disconnectWallet } = useWalletProviderContext();
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
      const provider: BrowserProvider = new BrowserProvider(selectedWallet.provider);

      setProvider(provider);
      // console.log('set Provider');
    } else {
      setProvider(null);
    }
  }, [selectedWallet]);

  // (2) Set ethers.Signer
  useEffect(() => {
    if (provider && selectedAccount) {
      (async function () {
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

  // (4) Set player information (user)
  useEffect(() => {
    if (contract && selectedAccount) {
      (async function () {
        const userInfo: MysteryChineseChess.PlayerStruct = await contract
          .getPlayer(selectedAccount as never)
          .catch((err) => {
            console.log(err);

            if (err.revert?.name == ContractError.ResourceNotFound) {
              return null;
            } else {
              setAuthMessage({ message: err.message, level: 'error' });
              throw err;
            }
          });

        if (userInfo) {
          // console.log(userInfo);
          setUserByPlayerStruct(userInfo);
          setRouter(MainNavigator);
          // console.log('switch acc if 0');
        } else {
          // If logged in and switch to non-existent account
          if (localStorage.getItem(LOCAL_STORAGE_KEYS.USER)) {
            // localStorage.removeItem(LOCAL_STORAGE_KEYS.USER);
            // console.log('switch acc else 1 if 0');
            disconnectWallet();
          } else {
            // If registering new account
            // console.log('switch acc else 1 if 1');
            await contract.on(contract.filters.NewPlayer, (newPlayer) => {
              if (!isSameAddress(newPlayer.playerAddress, selectedAccount)) {
                return;
              }

              console.log('received NewPlayer event');
              console.log(newPlayer);
              setUserByPlayerStruct(newPlayer as MysteryChineseChess.PlayerStruct);
              contract.off(contract.filters.NewPlayer);
            });
          }

          // setUser(null);
        }
      })();
    } else {
      const localUserInfoJson: string = localStorage.getItem(LOCAL_STORAGE_KEYS.USER);
      const selectedWalletRdns: string = localStorage.getItem(LOCAL_STORAGE_KEYS.SELECTED_WALLET_RDNS);
      const localUserInfo: MysteryChineseChess.PlayerStruct = localUserInfoJson
        ? (JSON.parse(localUserInfoJson) as never)
        : null;
      // console.log('In Auth context, setUser: ' + (localUserInfo ? 'read user info' : 'not found user info'));

      // If had logged in before and comes back
      if (
        localUserInfo &&
        selectedWalletRdns &&
        (!selectedAccount || isSameAddress(localUserInfo.playerAddress.toString(), selectedAccount))
      ) {
        setUserByPlayerStruct(localUserInfo);
        setRouter(MainNavigator);
      } else {
        setUser(null);
        setRouter(AuthNavigator);
      }
    }
  }, [contract, selectedAccount]);

  // (5) Store player information
  useEffect(() => {
    isSameAddress(selectedAccount, '');
    if (selectedAccount && user && isSameAddress(selectedAccount, user.playerAddress.toString())) {
      const storedUserInfo: MysteryChineseChess.PlayerStruct = {
        playerAddress: selectedAccount,
        playerName: user.playerName,
        elo: Number(user.elo),
        tableId: user.tableId.toString(),
      };

      localStorage.setItem(LOCAL_STORAGE_KEYS.USER, JSON.stringify(storedUserInfo));
    } else {
      const loggingOut = !localStorage.getItem(LOCAL_STORAGE_KEYS.SELECTED_WALLET_RDNS) && !selectedAccount && !user;
      const loadedInfoButNotSameAccount =
        selectedAccount && user && selectedAccount != user.playerAddress.toString().toLowerCase();
      // const loggedInButThenNotFoundAccount = localStorage.getItem(LOCAL_STORAGE_KEYS.USER) && selectedAccount && !user;
      if (loggingOut || loadedInfoButNotSameAccount) {
        localStorage.removeItem(LOCAL_STORAGE_KEYS.USER);
        console.log('remove storage.user');
      }
    }
  }, [user]);

  const authParams: AuthContextProps = {
    provider,
    setProvider,
    signer,
    setSigner,
    contract,
    setContract,
    user,
    setUserByPlayerStruct,
    authMessage,
    setAuthMessage,
  };

  return <AuthContext.Provider value={authParams}>{children}</AuthContext.Provider>;
};
