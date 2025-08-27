export interface Game {
  id: string;
  creatorId: string;
  opponentId: string | null;
  pendingOpponentId: string | null;
  status: string;
  timeControl: number;
  fen: string;
  moveHistory: string[];
  isPrivate: boolean;
  winnerId: string | null;
}

export interface CreateGamePayload {
  timeControl: number;
  isPrivate: boolean;
  password?: string;
}
