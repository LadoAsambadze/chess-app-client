import { useState } from 'react';
import apiClientAxios from '../../api/api-client-axios';

interface CreateGamePayload {
  timeControl: number;
  isPrivate: boolean;
  password?: string;
}

interface UseCreateGameReturn {
  createGame: (payload: CreateGamePayload) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export const useCreateGame = (): UseCreateGameReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createGame = async (payload: CreateGamePayload) => {
    setIsLoading(true);
    setError(null);

    try {
      await apiClientAxios.post('/games/create', payload);
    } catch (err: any) {
      console.error('Failed to create game:', err);
      setError(
        err?.response?.data?.message || err?.message || 'Failed to create game'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return { createGame, isLoading, error };
};
