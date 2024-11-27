import { useContext } from "react";
import { AuthContext } from '../context';

const useAuthContext = () => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAppContext must be used within an AuthProvider");
  }

  return context;
};

export default useAuthContext;
