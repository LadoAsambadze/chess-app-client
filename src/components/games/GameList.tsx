'use client';

import { Gamepad2, X, AlertCircle } from 'lucide-react';
import {
  useJoinGame,
  useGameRequests,
  useAcceptOpponent,
  useRejectOpponent,
  useCancelGame,
  useLeaveGame,
} from '../../hooks/useGame';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { JoinRequestModal } from './JoinRequestModal';
import { GameItem } from './GameItem';
import { useCurrentUser } from '../../hooks/useAuth';
import { useGetGames } from '../../hooks/games/useGetGames';

export function GamesList() {
  const navigate = useNavigate();
  const { data: currentUser } = useCurrentUser();
  const currentUserId = currentUser?.id;

  const { games, loading, error } = useGetGames();

  const joinMutation = useJoinGame();
  const acceptMutation = useAcceptOpponent();
  const rejectMutation = useRejectOpponent();
  const cancelMutation = useCancelGame();
  const leaveMutation = useLeaveGame();

  const {
    joinRequest,
    respondToJoinRequest,
    notifications,
    dismissNotification,
    clearAllNotifications,
  } = useGameRequests(currentUserId || '');

  const uniqueGames = Array.from(
    new Map((games ?? []).map((g) => [g.id, g])).values()
  );

  useEffect(() => {
    if (games && currentUserId) {
      const userGame = games.find(
        (game) =>
          game.opponentId === currentUserId && game.status === 'IN_PROGRESS'
      );
      if (userGame) {
        navigate(`/games/${userGame.id}`);
      }
    }
  }, [games, currentUserId, navigate]);

  const handleJoin = async (gameId: string) => {
    try {
      await joinMutation.mutateAsync({ gameId });
    } catch (error) {}
  };

  const handleCancel = (gameId: string) => {
    if (window.confirm('Cancel this game?')) {
      cancelMutation.mutate({ gameId });
    }
  };

  const handleLeave = (gameId: string) => {
    if (window.confirm('Leave this game?')) {
      leaveMutation.mutate({ gameId });
    }
  };

  const handleAcceptRequest = async () => {
    if (joinRequest) {
      try {
        await respondToJoinRequest(
          joinRequest.gameId,
          joinRequest.requesterId,
          true
        );
        navigate(`/games/${joinRequest.gameId}`);
      } catch (error) {
        // Error handled
      }
    }
  };

  const handleRejectRequest = async () => {
    if (joinRequest) {
      await respondToJoinRequest(
        joinRequest.gameId,
        joinRequest.requesterId,
        false
      );
    }
  };

  const handlePlayGame = (gameId: string) => {
    navigate(`/games/${gameId}`);
  };

  if (!currentUserId) {
    return (
      <div className="p-4 text-center">
        <p className="text-xs text-red-600">Please log in to view games</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="space-y-1">
          {notifications.map((notification, index) => (
            <div
              key={index}
              className="bg-blue-50 border border-blue-200 rounded p-2 flex items-center justify-between"
            >
              <div className="flex items-center gap-1">
                <AlertCircle className="w-3 h-3 text-blue-500" />
                <span className="text-xs text-blue-700">{notification}</span>
              </div>
              <button
                onClick={() => dismissNotification(index)}
                className="text-blue-500 hover:text-blue-700"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          {notifications.length > 1 && (
            <button
              onClick={clearAllNotifications}
              className="text-xs text-gray-500 hover:text-gray-700 underline"
            >
              Clear all
            </button>
          )}
        </div>
      )}

      {/* Join Request Modal */}
      <JoinRequestModal
        joinRequest={joinRequest}
        onAccept={handleAcceptRequest}
        onReject={handleRejectRequest}
        acceptMutation={acceptMutation}
        rejectMutation={rejectMutation}
      />

      {/* Games List */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="flex items-center justify-between p-3 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Gamepad2 className="w-3.5 h-3.5" />
            <h3 className="font-semibold text-gray-900 text-xs">
              Active Games
            </h3>
          </div>
          <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
            {games?.length || 0}
          </span>
        </div>

        <div className="p-2">
          {loading ? (
            <p className="text-xs text-gray-500 text-center py-6">Loading...</p>
          ) : error ? (
            <p className="text-xs text-red-600 text-center py-6">
              Error loading games
            </p>
          ) : !games || games.length === 0 ? (
            <p className="text-xs text-gray-500 text-center py-6">
              No games available
            </p>
          ) : (
            <div className="space-y-2">
              {uniqueGames.map((game) => (
                <GameItem
                  key={game.id}
                  game={game}
                  currentUserId={currentUserId}
                  onJoin={handleJoin}
                  onCancel={handleCancel}
                  onLeave={handleLeave}
                  onPlay={handlePlayGame}
                  joinMutation={joinMutation}
                  cancelMutation={cancelMutation}
                  leaveMutation={leaveMutation}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
