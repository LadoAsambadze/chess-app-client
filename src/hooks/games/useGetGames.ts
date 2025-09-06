import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import type { Game } from '../../types/games.type';
import apiClientAxios from '../../api/api-client-axios';

const SOCKET_URL = 'http://localhost:4000/games';

export function useGetGames() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGames = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClientAxios.get<Game[]>('/games');
      setGames(response.data);
    } catch (err: any) {
      console.error('Error fetching games:', err);
      setError(err?.response?.data?.message || 'Failed to load games');
    } finally {
      setLoading(false);
    }
  };

  

  useEffect(() => {
    fetchGames();
    const socket: Socket = io(`${SOCKET_URL}`, { withCredentials: true });

    socket.on('game:created', (game: Game) => {
      setGames((prev) => [game, ...prev]);
    });

    socket.on('game:updated', (updatedGame: Game) => {
      setGames((prev) =>
        prev.map((game) => (game.id === updatedGame.id ? updatedGame : game))
      );
    });

    socket.on('game:removed', (data: { gameId: string }) => {
      setGames((prev) => prev.filter((game) => game.id !== data.gameId));
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return { games, loading, error };
}
