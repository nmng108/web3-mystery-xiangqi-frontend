import PageContainer from '../../components/PageContainer.tsx';
import React from 'react';
import { useAuthContext } from '../../hooks';

const Leaderboard: React.FC = () => {
  const { setProvider } = useAuthContext();

  return (
    <PageContainer>
      <div className="flex bg-white flex-col justify-center items-center min-h-screen">
        <p className="text-xl text-green-500 font-bold">Dashboard</p>
      </div>
    </PageContainer>
  );
};

export default Leaderboard;
