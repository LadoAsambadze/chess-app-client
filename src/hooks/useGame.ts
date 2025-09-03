'use client';

import { useEffect, useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { io, type Socket } from 'socket.io-client';
import { gamesService } from '../services/games.service';
import type { Game } from '../types/games.type';

const SOCKET_URL = 'http://localhost:4000';
const GAMES_KEY = 'games';

export const useGetGames = () => {
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

    socket.on('game:updated', (updatedGame: Game) => {
      queryClient.setQueryData<Game[]>([GAMES_KEY], (prev = []) =>
        prev.map((game) => (game.id === updatedGame.id ? updatedGame : game))
      );
    });

    socket.on('game:removed', (data: { gameId: string }) => {
      queryClient.setQueryData<Game[]>([GAMES_KEY], (prev = []) =>
        prev.filter((game) => game.id !== data.gameId)
      );
    });

    return () => {
      socket.disconnect();
    };
  }, [queryClient]);

  return query;
};

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

export const useAcceptOpponent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (gameId: string) => gamesService.acceptOpponent(gameId),
    onSuccess: (updatedGame: Game) => {
      queryClient.setQueryData<Game[]>([GAMES_KEY], (prev = []) =>
        prev.map((game) => (game.id === updatedGame.id ? updatedGame : game))
      );
    },
  });
};

export const useRejectOpponent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (gameId: string) => gamesService.rejectOpponent(gameId),
    onSuccess: (updatedGame: Game) => {
      queryClient.setQueryData<Game[]>([GAMES_KEY], (prev = []) =>
        prev.map((game) => (game.id === updatedGame.id ? updatedGame : game))
      );
    },
  });
};

export const useCancelGame = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ gameId }: { gameId: string }) =>
      gamesService.cancelGame(gameId),
    onSuccess: (_, variables) => {
      // Remove the cancelled game from the list
      queryClient.setQueryData<Game[]>([GAMES_KEY], (prev = []) =>
        prev.filter((game) => game.id !== variables.gameId)
      );
    },
  });
};

export const useLeaveGame = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ gameId }: { gameId: string }) =>
      gamesService.leaveGame(gameId),
    onSuccess: () => {
      // Refetch games to get updated state
      queryClient.invalidateQueries({ queryKey: [GAMES_KEY] });
    },
  });
};

export const useGameRequests = (currentUserId: string) => {
  const [joinRequest, setJoinRequest] = useState<{
    gameId: string;
    requesterId: string;
    requesterName?: string;
  } | null>(null);

  const [notifications, setNotifications] = useState<string[]>([]);
  const socketRef = useRef<Socket | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!currentUserId) {
      return;
    }

    const socket: Socket = io(`${SOCKET_URL}/games`, {
      withCredentials: true,
      auth: { userId: currentUserId },
      autoConnect: true,
      forceNew: true,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('join-user-room', currentUserId);
    });

    socket.on('connection-confirmed', (data) => {
      // Connection confirmed
    });

    socket.on('room-joined', (data) => {
      // Room joined confirmed
    });

    // Listen for join requests
    socket.on(
      'game:join-requested',
      (data: {
        gameId: string;
        requesterId: string;
        requesterName?: string;
      }) => {
        setJoinRequest(data);
      }
    );

    // Listen for join responses
    socket.on(
      'game:join-response',
      (data: { gameId: string; accepted: boolean }) => {
        if (data.accepted) {
          setJoinRequest(null);
        }
      }
    );

    // Listen for request accepted
    socket.on(
      'game:request-accepted',
      (data: { gameId: string; game: Game }) => {
        setNotifications((prev) => [
          ...prev,
          `Your request to join game was accepted!`,
        ]);

        // Update games list
        queryClient.setQueryData<Game[]>([GAMES_KEY], (prev = []) =>
          prev.map((game) => (game.id === data.game.id ? data.game : game))
        );
      }
    );

    // Listen for request rejected
    socket.on(
      'game:request-rejected',
      (data: { gameId: string; message: string }) => {
        setNotifications((prev) => [
          ...prev,
          data.message || 'Your join request was rejected',
        ]);
      }
    );

    // Listen for opponent accepted
    socket.on(
      'game:opponent-accepted',
      (data: { gameId: string; game: Game }) => {
        setJoinRequest(null);

        // Update games list
        queryClient.setQueryData<Game[]>([GAMES_KEY], (prev = []) =>
          prev.map((game) => (game.id === data.game.id ? data.game : game))
        );
      }
    );

    // Listen for opponent rejected
    socket.on(
      'game:opponent-rejected',
      (data: { gameId: string; game: Game }) => {
        setJoinRequest(null);

        // Update games list
        queryClient.setQueryData<Game[]>([GAMES_KEY], (prev = []) =>
          prev.map((game) => (game.id === data.game.id ? data.game : game))
        );
      }
    );

    // Listen for modal close event (when requester leaves)
    socket.on('game:modal-close', (data: { gameId: string }) => {
      setJoinRequest((prev) => (prev?.gameId === data.gameId ? null : prev));
    });

    // Listen for request timeout event
    socket.on(
      'game:request-timeout',
      (data: { gameId: string; message: string; game: Game }) => {
        setJoinRequest((prev) => (prev?.gameId === data.gameId ? null : prev));
        setNotifications((prev) => [
          ...prev,
          data.message || 'Join request timed out',
        ]);

        // Update games list
        queryClient.setQueryData<Game[]>([GAMES_KEY], (prev = []) =>
          prev.map((game) => (game.id === data.game.id ? data.game : game))
        );
      }
    );

    // Listen for game cancelled
    socket.on('game:cancelled', (data: { gameId: string }) => {
      setNotifications((prev) => [
        ...prev,
        `Game ${data.gameId.slice(0, 8)}... was cancelled by the creator`,
      ]);

      // Clear join request if it matches the cancelled game
      setJoinRequest((prev) => (prev?.gameId === data.gameId ? null : prev));
    });

    // Listen for game finished (forfeit)
    socket.on(
      'game:finished',
      (data: { gameId: string; winnerId: string; reason: string }) => {
        if (data.reason === 'forfeit') {
          setNotifications((prev) => [
            ...prev,
            `Game ${data.gameId.slice(0, 8)}... ended - ${
              data.winnerId === currentUserId
                ? 'You won by forfeit!'
                : 'Opponent won by forfeit'
            }`,
          ]);
        }
      }
    );

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [currentUserId, queryClient]);

  const respondToJoinRequest = async (
    gameId: string,
    requesterId: string,
    accept: boolean
  ) => {
    try {
      if (accept) {
        await gamesService.acceptOpponent(gameId);
      } else {
        await gamesService.rejectOpponent(gameId);
      }

      setJoinRequest(null);
    } catch (error) {
      console.error('Error responding to join request:', error);
    }
  };

  const dismissNotification = (index: number) => {
    setNotifications((prev) => prev.filter((_, i) => i !== index));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  return {
    joinRequest,
    setJoinRequest,
    respondToJoinRequest,
    notifications,
    dismissNotification,
    clearAllNotifications,
    isConnected: socketRef.current?.connected || false,
    hasUserId: !!currentUserId,
  };
};
