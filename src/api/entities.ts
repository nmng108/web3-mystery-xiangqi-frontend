export interface Player {
  address: string;
  name: string;
  elo: number;
}

export interface TableEntity {
  id: number;
  // gameMode: GameMode;
  name: string;
  players: Player[]; // should be accessed using the constants 'BLACK', 'RED'
  hostIndex: 0 | 1;
  stake: number;
  timeControl: number;
  matchId?: number;
}

