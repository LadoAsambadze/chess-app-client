import { useEffect, useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { io, Socket } from 'socket.io-client';
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
    // Don't setup socket if no user ID
    if (!currentUserId) {
      console.log('⏳ No user ID provided, skipping socket setup');
      return;
    }

    console.log('🔌 Setting up socket connection for user:', currentUserId);

    // Create socket connection
    const socket: Socket = io(`${SOCKET_URL}/games`, {
      withCredentials: true,
      auth: { userId: currentUserId },
      autoConnect: true,
      forceNew: true,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('✅ Socket connected:', socket.id);
      console.log('👤 Joining user room:', currentUserId);
      socket.emit('join-user-room', currentUserId);
    });

    socket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
    });

    socket.on('connect_error', (error) => {
      console.error('🚨 Socket connection error:', error);
    });

    socket.on('connection-confirmed', (data) => {
      console.log('✅ Connection confirmed:', data);
    });

    socket.on('room-joined', (data) => {
      console.log('🏠 Room joined confirmed:', data);
    });

    // Listen for join requests
    socket.on(
      'game:join-requested',
      (data: {
        gameId: string;
        requesterId: string;
        requesterName?: string;
      }) => {
        console.log('📨 Received join request:', data);
        setJoinRequest(data);
      }
    );

    // Listen for join responses
    socket.on(
      'game:join-response',
      (data: { gameId: string; accepted: boolean }) => {
        console.log('📬 Join response received:', data);
        if (data.accepted) {
          console.log('✅ Request accepted, clearing join request');
          setJoinRequest(null);
        }
      }
    );

    // Listen for request accepted
    socket.on(
      'game:request-accepted',
      (data: { gameId: string; game: Game }) => {
        console.log('🎉 Join request was accepted:', data);
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
        console.log('❌ Join request was rejected:', data);
        setNotifications((prev) => [
          ...prev,
          data.message || 'Your join request was rejected',
        ]);
      }
    );

    // Listen for opponent accepted (for game creator)
    socket.on(
      'game:opponent-accepted',
      (data: { gameId: string; game: Game }) => {
        console.log('✅ Opponent accepted:', data);
        setJoinRequest(null); // Clear any pending requests

        // Update games list
        queryClient.setQueryData<Game[]>([GAMES_KEY], (prev = []) =>
          prev.map((game) => (game.id === data.game.id ? data.game : game))
        );
      }
    );

    // Listen for opponent rejected (for game creator)
    socket.on(
      'game:opponent-rejected',
      (data: { gameId: string; game: Game }) => {
        console.log('❌ Opponent rejected:', data);
        setJoinRequest(null); // Clear any pending requests

        // Update games list
        queryClient.setQueryData<Game[]>([GAMES_KEY], (prev = []) =>
          prev.map((game) => (game.id === data.game.id ? data.game : game))
        );
      }
    );

    return () => {
      console.log('🧹 Cleaning up socket connection');
      socket.disconnect();
      socketRef.current = null;
    };
  }, [currentUserId, queryClient]);

  // Function to accept/reject join requests (now using REST API)
  const respondToJoinRequest = async (
    gameId: string,
    requesterId: string,
    accept: boolean
  ) => {
    try {
      console.log(`📤 Responding to join request via API:`, {
        gameId,
        requesterId,
        accept,
      });

      if (accept) {
        await gamesService.acceptOpponent(gameId);
      } else {
        await gamesService.rejectOpponent(gameId);
      }

      // Clear the current request
      setJoinRequest(null);
    } catch (error) {
      console.error('❌ Error responding to join request:', error);
      // You might want to show an error message to the user here
    }
  };

  // Function to dismiss notifications
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
