import useContextHook from "../../hooks/useContextHook";
import PageContainer from "../../components/PageContainer.tsx";
import React from "react";

const MarketPlace: React.FC = () => {
  const {setIsAuthenticated} = useContextHook();

  const handlePressOnLogout = () => {
    setIsAuthenticated(false);
  };

  return (
    <PageContainer>
      <div className="flex bg-white flex-col justify-center items-center min-h-screen">
        <p className="text-xl text-green-500 font-bold">Marketplace</p>
      </div>
    </PageContainer>
  );
};

export default MarketPlace;
