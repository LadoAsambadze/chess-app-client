'use client';

import { useEffect, useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { io, type Socket } from 'socket.io-client';
import { gamesService } from '../services/games.service';
import type { Game } from '../types/games.type';

const SOCKET_URL = 'http://localhost:4000';
const GAMES_KEY = 'games';
const JOIN_REQUEST_STORAGE_KEY = 'pendingJoinRequest';

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
      queryClient.invalidateQueries({ queryKey: [GAMES_KEY] });
    },
  });
};

export const useGameRequests = (currentUserId: string) => {
  const [joinRequest, setJoinRequest] = useState<{
    gameId: string;
    requesterId: string;
    requesterName?: string;
    timestamp?: number;
  } | null>(null);

  const [notifications, setNotifications] = useState<string[]>([]);
  const socketRef = useRef<Socket | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!currentUserId) return;

    const stored = localStorage.getItem(
      `${JOIN_REQUEST_STORAGE_KEY}_${currentUserId}`
    );
    if (stored) {
      try {
        const parsedRequest = JSON.parse(stored);
        const now = Date.now();
        const elapsed = now - (parsedRequest.timestamp || now);

        if (elapsed < 30000) {
          setJoinRequest(parsedRequest);
        } else {
          localStorage.removeItem(
            `${JOIN_REQUEST_STORAGE_KEY}_${currentUserId}`
          );
        }
      } catch (error) {
        console.error('Error parsing stored join request:', error);
        localStorage.removeItem(`${JOIN_REQUEST_STORAGE_KEY}_${currentUserId}`);
      }
    }
  }, [currentUserId]);

  useEffect(() => {
    if (!currentUserId) return;

    if (joinRequest) {
      localStorage.setItem(
        `${JOIN_REQUEST_STORAGE_KEY}_${currentUserId}`,
        JSON.stringify(joinRequest)
      );
    } else {
      localStorage.removeItem(`${JOIN_REQUEST_STORAGE_KEY}_${currentUserId}`);
    }
  }, [joinRequest, currentUserId]);

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

    socket.on(
      'game:join-requested',
      (data: {
        gameId: string;
        requesterId: string;
        requesterName?: string;
      }) => {
        setJoinRequest({
          ...data,
          timestamp: Date.now(),
        });
      }
    );

    socket.on(
      'game:join-response',
      (data: { gameId: string; accepted: boolean }) => {
        if (data.accepted) {
          setJoinRequest(null);
        }
      }
    );

    socket.on(
      'game:request-accepted',
      (data: { gameId: string; game: Game }) => {
        setNotifications((prev) => [
          ...prev,
          `Your request to join game was accepted!`,
        ]);

        queryClient.setQueryData<Game[]>([GAMES_KEY], (prev = []) =>
          prev.map((game) => (game.id === data.game.id ? data.game : game))
        );
      }
    );

    socket.on(
      'game:request-rejected',
      (data: { gameId: string; message: string }) => {
        setNotifications((prev) => [
          ...prev,
          data.message || 'Your join request was rejected',
        ]);
      }
    );

    socket.on(
      'game:opponent-accepted',
      (data: { gameId: string; game: Game }) => {
        setJoinRequest(null);

        queryClient.setQueryData<Game[]>([GAMES_KEY], (prev = []) =>
          prev.map((game) => (game.id === data.game.id ? data.game : game))
        );
      }
    );

    socket.on(
      'game:opponent-rejected',
      (data: { gameId: string; game: Game }) => {
        setJoinRequest(null);

        queryClient.setQueryData<Game[]>([GAMES_KEY], (prev = []) =>
          prev.map((game) => (game.id === data.game.id ? data.game : game))
        );
      }
    );

    socket.on('game:modal-close', (data: { gameId: string }) => {
      setJoinRequest((prev) => (prev?.gameId === data.gameId ? null : prev));
    });

    socket.on(
      'game:request-timeout',
      (data: { gameId: string; message: string; game: Game }) => {
        setJoinRequest((prev) => (prev?.gameId === data.gameId ? null : prev));
        setNotifications((prev) => [
          ...prev,
          data.message || 'Join request timed out',
        ]);

        queryClient.setQueryData<Game[]>([GAMES_KEY], (prev = []) =>
          prev.map((game) => (game.id === data.game.id ? data.game : game))
        );
      }
    );

    socket.on('game:cancelled', (data: { gameId: string }) => {
      setNotifications((prev) => [
        ...prev,
        `Game ${data.gameId.slice(0, 8)}... was cancelled by the creator`,
      ]);

      setJoinRequest((prev) => (prev?.gameId === data.gameId ? null : prev));
    });

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
