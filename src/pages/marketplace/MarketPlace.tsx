import PageContainer from '../../components/PageContainer.tsx';
import React from 'react';
import { useAuthContext } from '../../hooks';

const MarketPlace: React.FC = () => {
  const { provider, signer, contract } = useAuthContext();

  return (
    <PageContainer>
      <div className="flex bg-white flex-col justify-center items-center min-h-screen">
        <p className="text-xl text-green-500 font-bold">Marketplace</p>
      </div>
    </PageContainer>
  );
};

export default MarketPlace;
