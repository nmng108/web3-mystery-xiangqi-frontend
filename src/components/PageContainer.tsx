import useContextHook from "../hooks/useContextHook.ts";
import Header from "./Header.tsx";
import {ThemeProvider} from "@material-tailwind/react";
import children = ThemeProvider.propTypes.children;
import React from "react";

type Props = {children?: React.ReactNode};

const PageContainer: React.FC<Props> = (props) => {
  const {setIsAuthenticated} = useContextHook();

  const handlePressOnLogout = () => {
    setIsAuthenticated(false);
  };

  return (
    <>
      <Header/>
      <button
        onClick={handlePressOnLogout}
        className="mt-4 w-44 border-red-500 border p-2 rounded-md cursor-pointer bg-red-500 text-white font-bold"
      >
        Press Logout
      </button>
      {children}
    </>
  );
};

export default PageContainer;
