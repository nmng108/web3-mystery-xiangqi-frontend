import useContextHook from "../../hooks/useContextHook.ts";
import React, {useCallback} from "react";
import {Button} from "@material-tailwind/react";
import ConnectWalletModal from "./ConnectWalletModal.tsx";

const Login: React.FC = () => {
  const {setIsAuthenticated} = useContextHook();
  const [isWalletModalOpen, setIsWalletModalOpen] = React.useState(false);
  const handleOpen = useCallback(() => {
    setIsWalletModalOpen((cur) => !cur);
  }, []);
  const handlePressOnLogin = useCallback(() => {
    setIsAuthenticated(true);
  }, [setIsAuthenticated]);

  return (
    <div className="flex bg-white flex-col justify-center items-center min-h-screen">
      <p className="text-xl text-green-500 font-bold">Login Page</p>
      <button
        onClick={handlePressOnLogin}
        className="mt-4 w-44 border-green-500 border p-2 rounded-md cursor-pointer bg-green-500 text-white font-bold"
      >
        Press Login
      </button>
      <Button onClick={handleOpen}>Connect Wallet</Button>
      <ConnectWalletModal isOpen={isWalletModalOpen} handleOpen={handleOpen}/>
    </div>
  );
};

export default Login;
