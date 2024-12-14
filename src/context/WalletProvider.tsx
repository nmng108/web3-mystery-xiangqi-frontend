import { Context, createContext, PropsWithChildren, useCallback, useEffect, useState } from 'react';
import { CHAIN_ID } from '../env.ts';
import { LOCAL_STORAGE_KEYS } from '../constants';

// Type alias for a record where the keys are wallet identifiers and the values are account
// addresses or null.
type SelectedAccountByWallet = Record<string, string | null>;

// Context interface for the EIP-6963 provider.
interface WalletProviderContextProps {
  /**
   * A list of wallets.
   */
  wallets: Record<string, EIP6963ProviderDetail>;
  /**
   * The selected wallet.
   */
  selectedWallet: EIP6963ProviderDetail | null;
  /**
   * The selected account address.
   */
  selectedAccount: string | null;
  /**
   * An error message.
   */
  errorMessage: string | null;
  /**
   * Function to connect wallets.
   */
  connectWallet: (walletUuid: string) => Promise<void>;
  /**
   * Function to disconnect wallets.
   */
  disconnectWallet: () => void;
  clearError: () => void;
}

export const WalletProviderContext: Context<WalletProviderContextProps> =
  createContext<WalletProviderContextProps>(null);

// The WalletProvider component wraps all other components in the dapp, providing them with the
// necessary data and functions related to wallets.
export const WalletProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [wallets, setWallets] = useState<Record<string, EIP6963ProviderDetail>>({});
  const [selectedWalletRdns, setSelectedWalletRdns] = useState<string | null>(null);
  const [selectedAccountAddressByWalletRdns, setSelectedAccountAddressByWalletRdns] = useState<SelectedAccountByWallet>(
    {}
  );

  const [errorMessage, setErrorMessage] = useState<string>('');
  const clearError = () => setErrorMessage('');
  const setError = (error: string) => setErrorMessage(error);

  useEffect(() => {
    const savedSelectedWalletRdns = localStorage.getItem('selectedWalletRdns');
    const savedSelectedAccountByWalletRdns = localStorage.getItem('selectedAccountByWalletRdns');

    if (savedSelectedAccountByWalletRdns) {
      setSelectedAccountAddressByWalletRdns(JSON.parse(savedSelectedAccountByWalletRdns));
    }

    async function onAnnouncement(event: EIP6963AnnounceProviderEvent) {
      setWallets((currentWallets) => ({
        ...currentWallets,
        [event.detail.info.rdns]: event.detail,
      }));

      if (savedSelectedWalletRdns && event.detail.info.rdns === savedSelectedWalletRdns) {
        setSelectedWalletRdns(savedSelectedWalletRdns);
      }
    }

    window.addEventListener('eip6963:announceProvider', onAnnouncement);
    window.dispatchEvent(new CustomEvent('eip6963:requestProvider'));

    return () => window.removeEventListener('eip6963:announceProvider', onAnnouncement);
  }, []);

  useEffect(() => {
    const wallet: EIP6963ProviderDetail = selectedWalletRdns ? wallets[selectedWalletRdns] : null;

    if (wallet) {
      wallet.provider.on('accountsChanged', ([newAccount]) => {
        const selectedAccountByWalletRdns = {
          ...selectedAccountAddressByWalletRdns,
          [wallet.info.rdns]: newAccount,
        };

        setSelectedAccountAddressByWalletRdns(selectedAccountByWalletRdns);
        localStorage.setItem(
          LOCAL_STORAGE_KEYS.SELECTED_ACCOUNT_BY_WALLET_RDNS,
          JSON.stringify(selectedAccountByWalletRdns)
        );
      });

      wallet.provider.on('chainChanged', (chainId) => {
        if (chainId != CHAIN_ID) {
          console.error("Connected chain's ID (%d) is not equal %d", chainId, CHAIN_ID);
          setError(`Chain ID is not equal ${CHAIN_ID}`);
        }
      });
    }

    return () => {
      if (wallet) {
        wallet.provider.removeAllListeners('accountsChanged');
      }
    };
  }, [selectedWalletRdns, wallets]);

  // useEffect(() => {
  //   // const wallet: EIP6963ProviderDetail = selectedWalletRdns ? wallets[selectedWalletRdns] : null;
  //   if (selectedWalletRdns) {
  //     localStorage.setItem(LOCAL_STORAGE_KEYS.SELECTED_WALLET_RDNS, selectedWalletRdns);
  //   } else {
  //     localStorage.removeItem(LOCAL_STORAGE_KEYS.SELECTED_WALLET_RDNS);
  //   }
  // }, [selectedWalletRdns]);
  //
  // useEffect(() => {
  //   if (selectedAccountAddressByWalletRdns && Object.keys(selectedAccountAddressByWalletRdns).length > 0) {
  //     localStorage.setItem(
  //       LOCAL_STORAGE_KEYS.SELECTED_ACCOUNT_BY_WALLET_RDNS, JSON.stringify(selectedAccountAddressByWalletRdns),
  //     );
  //   } else {
  //     localStorage.removeItem(LOCAL_STORAGE_KEYS.SELECTED_ACCOUNT_BY_WALLET_RDNS);
  //   }
  // }, [selectedAccountAddressByWalletRdns]);

  const connectWallet = useCallback(
    async (walletRdns: string) => {
      try {
        const wallet: EIP6963ProviderDetail = wallets[walletRdns];
        const accountAddresses: string[] = (await wallet.provider.request({
          method: 'eth_requestAccounts',
        })) as string[];
        const chainId: number = (await wallet.provider.request({ method: 'eth_chainId' })) as number;

        if (chainId != CHAIN_ID) {
          console.error("Connected chain's ID (%d) is not equal %d", chainId, CHAIN_ID);
          setError(`Chain ID is not equal ${CHAIN_ID}`);
          return;
        }

        if (accountAddresses?.[0]) {
          setSelectedWalletRdns(wallet.info.rdns);
          setSelectedAccountAddressByWalletRdns((currentAccounts) => ({
            ...currentAccounts,
            [wallet.info.rdns]: accountAddresses[0],
          }));

          localStorage.setItem(LOCAL_STORAGE_KEYS.SELECTED_WALLET_RDNS, wallet.info.rdns);
          localStorage.setItem(
            LOCAL_STORAGE_KEYS.SELECTED_ACCOUNT_BY_WALLET_RDNS,
            JSON.stringify({ ...selectedAccountAddressByWalletRdns, [wallet.info.rdns]: accountAddresses[0] })
          );
        }
      } catch (error) {
        console.error('Failed to connect to provider:', error);
        const walletError: WalletError = error as WalletError;
        setError(`Code: ${walletError.code} \nError Message: ${walletError.message}`);
      }
    },
    [wallets, selectedAccountAddressByWalletRdns]
  );

  const disconnectWallet = useCallback(async () => {
    if (selectedWalletRdns) {
      setSelectedAccountAddressByWalletRdns((currentAccounts) => ({
        ...currentAccounts,
        [selectedWalletRdns]: null,
      }));

      const wallet: EIP6963ProviderDetail = wallets[selectedWalletRdns];

      setSelectedWalletRdns(null);
      localStorage.removeItem(LOCAL_STORAGE_KEYS.SELECTED_WALLET_RDNS);

      try {
        await wallet.provider.request({
          method: 'wallet_revokePermissions',
          params: [{ eth_accounts: {} }],
        });
      } catch (error) {
        console.error('Failed to revoke permissions:', error);
      }
    }
  }, [selectedWalletRdns, wallets]);

  const contextValue: WalletProviderContextProps = {
    wallets,
    selectedWallet: selectedWalletRdns === null ? null : wallets[selectedWalletRdns],
    selectedAccount: selectedWalletRdns === null ? null : selectedAccountAddressByWalletRdns[selectedWalletRdns],
    errorMessage,
    connectWallet,
    disconnectWallet,
    clearError,
  };

  return <WalletProviderContext.Provider value={contextValue}>{children}</WalletProviderContext.Provider>;
};
