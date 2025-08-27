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

  joinGame: (gameId: string, password?: string): Promise<Game> => {
    return apiClient(`/games/join/${gameId}`, {
      method: 'POST',
      body: JSON.stringify({ password }),
    });
  },

  // Get game by ID
  getGameById: (gameId: string): Promise<Game> => {
    return apiClient(`/games/${gameId}`);
  },
};
