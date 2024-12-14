import React, { useCallback, useEffect, useState } from 'react';
import { useAuthContext, useGlobalContext, useWalletProviderContext } from '../../hooks';
import ConnectWalletModal from './ConnectWalletModal.tsx';
import {
  Alert,
  Backdrop,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  type PaperProps,
  Snackbar,
  TextField,
  Typography,
} from '@mui/material';
import MainNavigator from '../../navigations/MainNavigator.tsx';

type RegistrationMessage =
  | undefined
  | {
      message: string;
      color: string;
    };

const Login: React.FC = () => {
  const [isWalletModalOpen, setIsWalletModalOpen] = useState<boolean>(false);
  const [loadingPlayerInfo, setLoadingPlayerInfo] = useState<boolean>(false);
  const [showsWalletConnectionError, setShowsWalletConnectionError] = useState<boolean>(false);
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState<boolean>(false);
  const [waitForRegistrationMessage, setWaitForRegistrationMessage] = useState<RegistrationMessage>();
  const { selectedAccount, errorMessage: walletException, clearError } = useWalletProviderContext();
  const { setRouter } = useGlobalContext();
  const { contract, user, authMessage, setAuthMessage } = useAuthContext();

  const handleCloseWalletModal = useCallback(() => {
    setIsWalletModalOpen((cur) => !cur);
  }, []);

  const handleCloseWalletConnectionError = useCallback(() => {
    clearError();
    setAuthMessage(undefined);
  }, [clearError, setAuthMessage]);

  // /**
  //  * For test purpose. Deleted later
  //  */
  // const handlePressOnLogin = useCallback(() => {
  //   setUser({ playerAddress: '0x11111', playerName: 'namng108', elo: 123, tableId: 0 });
  // }, [setUser]);

  /**
   * Register new user
   */
  const handleRegisterNewPlayer = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      type FormJson = { name: string };
      const formJson: FormJson = Object.fromEntries(new FormData(event.currentTarget).entries()) as FormJson;
      const name: string = formJson.name;

      try {
        await contract.registerPlayer(name as never);

        setLoadingPlayerInfo(false);
        setIsRegistrationModalOpen(false);
      } catch (ex) {
        if (('info' in ex && 'error' in ex.info) || 'error' in ex) {
          const message = ex.error?.message || ex.info.error.message;

          setAuthMessage({ message: message, level: 'error', duration: 4000 });
        }
      }
    },
    [contract, setAuthMessage]
  );

  useEffect(() => {
    setLoadingPlayerInfo(selectedAccount && !user);
    setIsRegistrationModalOpen(selectedAccount && (!user || !user.playerName));
  }, [selectedAccount, user]);

  useEffect(() => {
    setWaitForRegistrationMessage(
      selectedAccount && !isRegistrationModalOpen
        ? !user
          ? {
              message: 'Just a minute! Waiting for your account to be registered...',
              color: 'text-zinc-800',
            }
          : { message: 'Account created! Logging into game...', color: 'text-lime-700' }
        : undefined
    );

    if (selectedAccount && !isRegistrationModalOpen && user) {
      setTimeout(() => setRouter(MainNavigator), 2000);
    }
  }, [selectedAccount, user, isRegistrationModalOpen, setRouter]);

  // TODO: consider to remove `showsWalletConnectionError` state variable
  useEffect(() => {
    setShowsWalletConnectionError(!!walletException || !!authMessage);
  }, [walletException, authMessage]);

  return (
    <div className="w-full h-screen bg-main-img bg-cover bg-center bg-fixed flex items-center justify-center">
      {/*Overlay*/}
      <div className="max-w-md md:max-w-lg lg:max-w-2xl xl:max-w-3xl w-full border-1 rounded-lg text-center text-white backdrop-blur-md bg-blue-gray-900 bg-opacity-60">
        <div className="text-center text-white p-8 rounded-lg backdrop-blur-md">
          <h1 className="text-3xl md:text-4xl font-bold mb-6 text-blue-950">Welcome to Mystery Xiangqi</h1>
          {waitForRegistrationMessage && (
            <h4 className={`${waitForRegistrationMessage.color}`}>{waitForRegistrationMessage.message}</h4>
          )}
          {!selectedAccount && (
            <>
              <p className="mb-8 text-lg md:text-xl text-blue-950">Connect your wallet to continue</p>
              <Button variant="contained" color="primary" size="large" onClick={handleCloseWalletModal}>
                {/*<Typography>*/}
                Connect Wallet
                {/*</Typography>*/}
              </Button>
            </>
          )}
          {/*<Button*/}
          {/*  variant="outlined"*/}
          {/*  onClick={handlePressOnLogin}*/}
          {/*  className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition-all duration-200"*/}
          {/*>*/}
          {/*  Press Login<br />(test only)*/}
          {/*</Button>*/}
          <ConnectWalletModal isOpen={isWalletModalOpen} handleClose={handleCloseWalletModal} />
          <Dialog
            open={isRegistrationModalOpen}
            onClose={() => undefined}
            maxWidth="xs"
            fullWidth
            PaperProps={
              { component: 'form', onSubmit: handleRegisterNewPlayer } as Partial<PaperProps<React.ElementType>>
            }
          >
            {/* Dialog Header */}
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
              <Typography variant="h5">Set your name</Typography>
            </DialogTitle>
            <DialogContent>
              <DialogContentText sx={{ textAlign: 'left' }}>Let other people identify you easily</DialogContentText>
              <TextField
                autoFocus
                required
                margin="dense"
                id="name"
                name="name"
                label="Name"
                type="text"
                fullWidth
                variant="standard"
              />
            </DialogContent>
            <DialogActions>
              <Button type="submit">Register</Button>
            </DialogActions>
          </Dialog>
        </div>
      </div>
      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        // TransitionComponent={(props: SlideProps) => (<Slide {...props} direction="down" />)}
        autoHideDuration={authMessage?.duration || 2000}
        open={showsWalletConnectionError}
        onClose={handleCloseWalletConnectionError}
      >
        <Alert severity="error">{walletException || authMessage?.message}</Alert>
      </Snackbar>
      <Backdrop sx={(theme) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })} open={loadingPlayerInfo}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </div>
  );
};

export default Login;
