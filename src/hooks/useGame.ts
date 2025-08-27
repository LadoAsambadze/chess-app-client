import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { io, Socket } from 'socket.io-client';
import { gamesService } from '../services/games.service';
import type { Game } from '../types/games.type';

const SOCKET_URL = 'http://localhost:4000';
const GAMES_KEY = 'games';

// --- Fetch all games ---
export const useGames = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [GAMES_KEY],
    queryFn: gamesService.getGames,
  });

  useEffect(() => {
    const socket: Socket = io(`${SOCKET_URL}/games`, { withCredentials: true });

    socket.on('game:created', (game: Game) => {
      queryClient.setQueryData<Game[]>([GAMES_KEY], (prev = []) => [
        game,
        ...prev,
      ]);
    });

    return () => {
      socket.disconnect();
    };
  }, [queryClient]);

  return query;
};

// --- Create a new game ---
export const useCreateGame = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: gamesService.createGame,
    onSuccess: (newGame) => {
      queryClient.setQueryData<Game[]>([GAMES_KEY], (prev = []) => [
        newGame,
        ...prev,
      ]);
    },
  });
};

// --- Join a game ---
export const useJoinGame = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ gameId, password }: { gameId: string; password?: string }) =>
      gamesService.joinGame(gameId, password),
    onSuccess: (updatedGame: Game) => {
      queryClient.setQueryData<Game[]>([GAMES_KEY], (prev = []) =>
        prev.map((game) => (game.id === updatedGame.id ? updatedGame : game))
      );
    },
  });
};

export const useGameRequests = (currentUserId: string) => {
  const [joinRequest, setJoinRequest] = useState<{
    gameId: string;
    requesterId: string;
  } | null>(null);

  useEffect(() => {
    const socket: Socket = io(`${SOCKET_URL}/games`, {
      withCredentials: true,
      auth: { userId: currentUserId }, // join user's room
    });

    socket.on(
      'games:join-requested',
      (data: { gameId: string; requesterId: string }) => {
        setJoinRequest(data); // trigger modal
      }
    );

    return () => {
      socket.disconnect();
    };
  }, [currentUserId]);

  return { joinRequest, setJoinRequest };
};
