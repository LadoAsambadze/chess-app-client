import { apiClient } from '../api/api-client';
import type { CreateGamePayload, Game } from '../types/games.type';

export const gamesService = {
  // Get all games
  getGames: (): Promise<Game[]> => {
    return apiClient('/games');
  },

  // Create a new game
  createGame: (payload: CreateGamePayload): Promise<Game> => {
    return apiClient('/games/create', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // Join a game
  joinGame: (gameId: string, password?: string): Promise<Game> => {
    return apiClient(`/games/join/${gameId}`, {
      method: 'POST',
      body: JSON.stringify({ password }),
    });
  },

  // Accept opponent join request
  acceptOpponent: (gameId: string): Promise<Game> => {
    return apiClient(`/games/accept/${gameId}`, {
      method: 'POST',
    });
  },

  // Reject opponent join request
  rejectOpponent: (gameId: string): Promise<Game> => {
    return apiClient(`/games/reject/${gameId}`, {
      method: 'POST',
    });
  },

  // Get game by ID
  getGameById: (gameId: string): Promise<Game> => {
    return apiClient(`/games/${gameId}`);
  },
};
