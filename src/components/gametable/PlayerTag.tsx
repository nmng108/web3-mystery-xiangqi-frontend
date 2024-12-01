import React from 'react';
import { useAuthContext } from '../../hooks';
import defaultAvatar from '../../assets/default-avatar.svg';
import { MysteryChineseChess } from '../../contracts/typechain-types';

interface PlayerTagProps {
  player: MysteryChineseChess.PlayerStruct | null;
  isHost: boolean;
}

const PlayerTag: React.FC<PlayerTagProps> = ({ player, isHost }) => {
  const { user } = useAuthContext();

  if (player == null) {
    return (
      <div className="text-black text-xl font-normal font-['Arial']">
        Wait for opponent...
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <img src={defaultAvatar} alt="Avatar" className="w-10 h-10 rounded-full" />
      <div className="flex flex-col items-start">
        <div className="text-black text-2xl font-normal font-['Arial']">
          {(user.playerAddress == player.playerName) ? 'You' : player.playerName} {isHost ? '(Host)' : ''}
        </div>
        <div className="text-black text-base font-normal font-['Arial']">Elo: {player.elo.toString()}</div>
      </div>
    </div>
  );
};

export default PlayerTag;
