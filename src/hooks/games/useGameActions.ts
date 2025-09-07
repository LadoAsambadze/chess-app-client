import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import apiClientAxios from '../../api/api-client-axios';
import { useParams } from 'react-router-dom';
import { useCurrentUser } from '../auth/useCurrentUser';

const SOCKET_URL = 'http://localhost:4000/games';

interface DrawOfferData {
  gameId: string;
  offererId: string;
  message: string;
}

interface DrawResponseData {
  gameId: string;
  accepted: boolean;
  message: string;
}

interface GameFinishedData {
  gameId: string;
  winnerId: string | null;
  reason: string;
  isDraw?: boolean;
  isWinner?: boolean;
  message?: string;
}

export function useGameActions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Draw-specific states
  const [drawOfferReceived, setDrawOfferReceived] =
    useState<DrawOfferData | null>(null);
  const [showDrawOfferModal, setShowDrawOfferModal] = useState(false);
  const [drawOfferSent, setDrawOfferSent] = useState(false);

  // Game end states
  const [gameFinishedData, setGameFinishedData] =
    useState<GameFinishedData | null>(null);
  const [showGameEndModal, setShowGameEndModal] = useState(false);

  const params = useParams();
  const { user } = useCurrentUser();

  // Resign game function
  const resignGame = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClientAxios.post(
        `/games/resign/${params.gameId}`
      );
      return response.data;
    } catch (err: any) {
      console.error('Error resigning game:', err);
      setError(err?.response?.data?.message || 'Failed to resign game');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Offer draw function
  const offerDraw = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClientAxios.post(
        `/games/offer-draw/${params.gameId}`
      );
      setDrawOfferSent(true);
      return response.data;
    } catch (err: any) {
      console.error('Error offering draw:', err);
      setError(err?.response?.data?.message || 'Failed to offer draw');
      setDrawOfferSent(false);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Respond to draw function
  const respondToDraw = async (accept: boolean) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClientAxios.post(
        `/games/respond-draw/${params.gameId}`,
        { accept }
      );
      setShowDrawOfferModal(false);
      setDrawOfferReceived(null);
      return response.data;
    } catch (err: any) {
      console.error('Error responding to draw:', err);
      setError(err?.response?.data?.message || 'Failed to respond to draw');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user?.id || !params.gameId) return;

    const socket: Socket = io(`${SOCKET_URL}`, {
      withCredentials: true,
      auth: {
        userId: user.id,
      },
    });

    socket.emit('join-game', { gameId: params.gameId });

    // Listen for draw offers
    socket.on('game:draw-offer', (data: DrawOfferData) => {
      console.log('Draw offer received:', data);
      if (data.gameId === params.gameId && data.offererId !== user.id) {
        setDrawOfferReceived(data);
        setShowDrawOfferModal(true);
      }
    });

    // Listen for draw responses
    socket.on('game:draw-response', (data: DrawResponseData) => {
      console.log('Draw response received:', data);
      if (data.gameId === params.gameId) {
        setDrawOfferSent(false);
        if (!data.accepted) {
          setError('Your draw offer was declined');
          setTimeout(() => setError(null), 3000);
        }
      }
    });

    // Listen for game finished events
    socket.on(
      'game:finished',
      (data: { gameId: string; winnerId: string | null; reason: string }) => {
        console.log('Game finished:', data);

        if (data.gameId === params.gameId) {
          const isDraw = data.winnerId === null || data.reason === 'draw';
          let message = '';
          let isWinner = false;

          if (isDraw) {
            message = 'Game ended in a draw!';
          } else if (data.reason === 'resignation') {
            isWinner = data.winnerId === user.id;
            message = isWinner
              ? 'You won! Your opponent resigned.'
              : 'You resigned and lost the game.';
          } else {
            isWinner = data.winnerId === user.id;
            message = isWinner
              ? `You won! ${data.reason}`
              : `You lost! ${data.reason}`;
          }

          setGameFinishedData({
            ...data,
            isDraw,
            isWinner,
            message,
          });
          setShowGameEndModal(true);

          // Clear any pending states
          setDrawOfferSent(false);
          setShowDrawOfferModal(false);
          setDrawOfferReceived(null);
        }
      }
    );

    // Handle connection errors
    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setError('Connection failed. Please refresh the page.');
    });

    return () => {
      socket.disconnect();
    };
  }, [params.gameId, user?.id]);

  const closeModal = () => {
    setShowGameEndModal(false);
    setGameFinishedData(null);
    setError(null);
  };

  const closeDrawOfferModal = () => {
    setShowDrawOfferModal(false);
    setDrawOfferReceived(null);
  };

  return {
    // Actions
    resignGame,
    offerDraw,
    respondToDraw,

    // States
    loading,
    error,

    // Draw states
    drawOfferReceived,
    showDrawOfferModal,
    drawOfferSent,

    // Game end states
    gameFinishedData,
    showGameEndModal,

    // Modal controls
    closeModal,
    closeDrawOfferModal,
  };
}
