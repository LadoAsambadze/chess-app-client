import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export interface Game {
  id: string;
  creatorId: string;
  opponentId?: string | null;
  pendingOpponentId?: string | null;
  timeControl: number;
  isPrivate: boolean;
  status: 'WAITING' | 'IN_PROGRESS' | 'COMPLETED';
  fen: string;
  moveHistory: string[];
  winnerId?: string | null;
}

export function useGamesSocket() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [games, setGames] = useState<Game[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');

    if (!token) return;

    const socketInstance = io('/games', {
      auth: { token },
      autoConnect: true,
    });

    socketInstance.on('connect', () => {
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
    });

    socketInstance.on('game:created', (data: { game: Game }) => {
      setGames((prev) => [data.game, ...prev]);
    });

    socketInstance.on('game:created:own', (data: { game: Game }) => {
      setGames((prev) => {
        const exists = prev.find((g) => g.id === data.game.id);
        return exists ? prev : [data.game, ...prev];
      });
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const watchGame = (gameId: string) => {
    if (socket) {
      socket.emit('watch', gameId);
    }
  };

  const unwatchGame = (gameId: string) => {
    if (socket) {
      socket.emit('unwatch', gameId);
    }
  };

  const loadInitialGames = async () => {
    try {
      const response = await fetch('http://localhost:4000/games', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      const initialGames = await response.json();
      setGames(initialGames);
    } catch (error) {
      console.error('Failed to load initial games:', error);
    }
  };

  useEffect(() => {
    if (isConnected) {
      loadInitialGames();
    }
  }, [isConnected]);

  return {
    socket,
    games,
    isConnected,
    watchGame,
    unwatchGame,
    refreshGames: loadInitialGames,
  };
}
