import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const useAppContext = () => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAppContext must be used within an AuthProvider");
  }

  return context;
};

export default useAppContext;
