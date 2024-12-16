import React, { useEffect, useState } from 'react';
import { redirect } from 'react-router-dom';
import { Backdrop, CircularProgress } from '@mui/material';
import { useAuthContext, useGlobalContext, useWalletProviderContext } from '../hooks';
import Header from './Header.tsx';
import Footer from './Footer.tsx';
import { LOCAL_STORAGE_KEYS, ROUTES } from '../constants';
import AuthNavigator from '../navigations/AuthNavigator';

type Props = { children?: React.ReactNode };

const PageContainer: React.FC<Props> = ({ children }) => {
  const [loadingPlayerInfo, setLoadingPlayerInfo] = useState<boolean>(false);
  const { selectedAccount } = useWalletProviderContext();
  const { user } = useAuthContext();
  const { router } = useGlobalContext();

  useEffect(() => {
    if (router == AuthNavigator) {
      redirect(ROUTES.INDEX);
    }
  }, [router]);

  useEffect(() => {
    const storedUser = localStorage.getItem(LOCAL_STORAGE_KEYS.USER);
    const storedSelectedWalletRDNS = localStorage.getItem(LOCAL_STORAGE_KEYS.SELECTED_WALLET_RDNS);
    const justComesBackAfterSignedIn: boolean =
      storedUser && storedSelectedWalletRDNS && ((!selectedAccount && !user) || (selectedAccount != null && !user));
    const loggingOut: boolean = !selectedAccount && user != null;

    setLoadingPlayerInfo(justComesBackAfterSignedIn || loggingOut);
  }, [selectedAccount, user]);

  return (
    <>
      <Header />
      <main className="w-full h-dvh bg-main-img bg-cover bg-center bg-fixed">
        {' '}
        {/*flex items-center justify-center*/}
        {/*<div className="min-h-screen bg-gray-700 text-gray-900">*/}
        {children}
        {/*</div>*/}
      </main>
      <Footer />
      <Backdrop sx={(theme) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })} open={loadingPlayerInfo}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </>
  );
};

export default PageContainer;
