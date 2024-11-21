import React, { useCallback } from 'react';
import { useAuthContext } from '../../hooks';
import ConnectWalletModal from './ConnectWalletModal.tsx';
import { Button, Typography } from '@mui/material';

const Login: React.FC = () => {
  const { setIsAuthenticated } = useAuthContext();
  const [isWalletModalOpen, setIsWalletModalOpen] = React.useState(false);

  const handleCloseWalletModal = useCallback(() => {
    setIsWalletModalOpen((cur) => !cur);
  }, []);

  const handlePressOnLogin = useCallback(() => {
    setIsAuthenticated(true);
  }, [setIsAuthenticated]);

  return (
    <div className="w-full h-screen bg-main-img bg-cover bg-center bg-fixed flex items-center justify-center">
      {/*Overlay*/}
      <div className="max-w-md md:max-w-lg lg:max-w-2xl xl:max-w-3xl w-full border-1 rounded-lg text-center text-white backdrop-blur-md bg-blue-gray-900 bg-opacity-60">
        <div className="text-center text-white p-8 rounded-lg backdrop-blur-md">
          <h1 className="text-3xl md:text-4xl font-bold mb-6">Welcome to Mystery Xiangqi</h1>
          <p className="mb-8 text-lg md:text-xl">Connect your wallet to continue</p>
          <Button
            varian="outlined"
            onClick={handlePressOnLogin}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition-all duration-200"
          >
            Press Login
          </Button>
          <Button variant="contained" color="primary" size="large" onClick={handleCloseWalletModal}>
            {/*<Typography>*/}
            Connect Wallet
            {/*</Typography>*/}
          </Button>
          <ConnectWalletModal isOpen={isWalletModalOpen} handleClose={handleCloseWalletModal} />
        </div>
      </div>
    </div>
  );
};

export default Login;
