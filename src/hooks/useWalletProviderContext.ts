import { useContext } from 'react';
import { WalletProviderContext } from '../context';

const useWalletProviderContext = () => useContext(WalletProviderContext);

export default useWalletProviderContext;