import { Context, createContext, PropsWithChildren, useCallback, useEffect, useState } from 'react';
import { CHAIN_ID } from '../contracts/abi';


// Type alias for a record where the keys are wallet identifiers and the values are account
// addresses or null.
type SelectedAccountByWallet = Record<string, string | null>

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

export const WalletProviderContext: Context<WalletProviderContextProps> = createContext<WalletProviderContextProps>(null);

const localStorageItems: Record<string, string> = {
  selectedWalletRdns: 'selectedWalletRdns',
  selectedAccountByWalletRdns: 'selectedAccountByWalletRdns',
};

// The WalletProvider component wraps all other components in the dapp, providing them with the
// necessary data and functions related to wallets.
export const WalletProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [wallets, setWallets] = useState<Record<string, EIP6963ProviderDetail>>({});
  const [selectedWalletRdns, setSelectedWalletRdns] = useState<string | null>(null);
  const [selectedAccountAddressByWalletRdns, setSelectedAccountAddressByWalletRdns] = useState<SelectedAccountByWallet>({});

  const [errorMessage, setErrorMessage] = useState<string>('');
  const clearError = () => setErrorMessage('');
  const setError = (error: string) => setErrorMessage(error);

  useEffect(() => {
    const savedSelectedWalletRdns = localStorage.getItem('selectedWalletRdns');
    const savedSelectedAccountByWalletRdns = localStorage.getItem('selectedAccountByWalletRdns');

    if (savedSelectedAccountByWalletRdns) {
      setSelectedAccountAddressByWalletRdns(JSON.parse(savedSelectedAccountByWalletRdns));
    }

    function onAnnouncement(event: EIP6963AnnounceProviderEvent) {
      setWallets(currentWallets => ({
        ...currentWallets,
        [event.detail.info.rdns]: event.detail,
      }));

      if (savedSelectedWalletRdns && (event.detail.info.rdns === savedSelectedWalletRdns)) {
        setSelectedWalletRdns(savedSelectedWalletRdns);
      }
    }

    window.addEventListener('eip6963:announceProvider', onAnnouncement);
    window.dispatchEvent(new CustomEvent('eip6963:requestProvider'));

    return () => window.removeEventListener('eip6963:announceProvider', onAnnouncement);
  }, []);

  const connectWallet = useCallback(async (walletRdns: string) => {
    try {
      const wallet: EIP6963ProviderDetail = wallets[walletRdns];
      const accountAddresses: string[] = (await wallet.provider.request({ method: 'eth_requestAccounts' })) as string[];
      const chainId: number = (await wallet.provider.request({ method: 'eth_chainId' })) as number;

      if (chainId != CHAIN_ID) {
        console.error('Connected chain\'s ID (%d) is not equal %d', chainId, CHAIN_ID);
        setError(`Chain ID is not equal ${CHAIN_ID}`);
        return;
      }

      if (accountAddresses?.[0]) {
        setSelectedWalletRdns(wallet.info.rdns);
        setSelectedAccountAddressByWalletRdns((currentAccounts) => ({
          ...currentAccounts,
          [wallet.info.rdns]: accountAddresses[0],
        }));

        localStorage.setItem(localStorageItems.selectedWalletRdns, wallet.info.rdns);
        localStorage.setItem(
          localStorageItems.selectedAccountByWalletRdns,
          JSON.stringify({
            ...selectedAccountAddressByWalletRdns,
            [wallet.info.rdns]: accountAddresses[0],
          }),
        );
      }
    } catch (error) {
      console.error('Failed to connect to provider:', error);
      const walletError: WalletError = error as WalletError;
      setError(
        `Code: ${walletError.code} \nError Message: ${walletError.message}`,
      );
    }
  }, [wallets, selectedAccountAddressByWalletRdns]);

  const disconnectWallet = useCallback(async () => {
    if (selectedWalletRdns) {
      setSelectedAccountAddressByWalletRdns((currentAccounts) => ({
        ...currentAccounts,
        [selectedWalletRdns]: null,
      }));

      const wallet: EIP6963ProviderDetail = wallets[selectedWalletRdns];
      setSelectedWalletRdns(null);
      localStorage.removeItem(localStorageItems.selectedWalletRdns);

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
    selectedWallet: (selectedWalletRdns === null) ? null : wallets[selectedWalletRdns],
    selectedAccount: (selectedWalletRdns === null) ? null : selectedAccountAddressByWalletRdns[selectedWalletRdns],
    errorMessage,
    connectWallet,
    disconnectWallet,
    clearError,
  };

  return (
    <WalletProviderContext.Provider value={contextValue}>{children}</WalletProviderContext.Provider>
  );
};