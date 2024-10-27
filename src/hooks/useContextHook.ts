import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const useContextHook = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useContextHook must be used within an AuthProvider");
  }
  return context;
};

export default useContextHook;
