import {
  Clock,
  Gamepad2,
  X,
  Check,
  AlertCircle,
  Trash,
  LogOutIcon,
} from 'lucide-react';
import {
  useGetGames,
  useJoinGame,
  useGameRequests,
  useAcceptOpponent,
  useRejectOpponent,
  useCancelGame,
  useLeaveGame,
} from '../../hooks/useGame';
import { useState, useEffect } from 'react';
import { useCurrentUser } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export default function GamesList() {
  const navigate = useNavigate();

  const {
    data: currentUser,
    isPending: userLoading,
    error: userError,
  } = useCurrentUser();
  const currentUserId = currentUser?.id;

  const joinMutation = useJoinGame();
  const acceptMutation = useAcceptOpponent();
  const rejectMutation = useRejectOpponent();
  const cancelMutation = useCancelGame();
  const leaveMutation = useLeaveGame();

  const { data: games, isPending: loading, error } = useGetGames();
  const {
    joinRequest,
    respondToJoinRequest,
    notifications,
    dismissNotification,
    clearAllNotifications,
  } = useGameRequests(currentUserId || '');

  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    if (joinRequest) {
      setShowAlert(true);
    } else {
      setShowAlert(false);
    }
  }, [joinRequest]);

  // Listen for game status changes to redirect requesting users when accepted
  useEffect(() => {
    if (games && currentUserId) {
      const userGame = games.find(
        (game) =>
          game.opponentId === currentUserId && game.status === 'IN_PROGRESS'
      );

      // If user was just accepted into a game (became opponent), redirect them
      if (userGame) {
        navigate(`/games/${userGame.id}`);
      }
    }
  }, [games, currentUserId, navigate]);

  // Fixed handleJoin - removed immediate navigation
  const handleJoin = async (gameId: string) => {
    try {
      await joinMutation.mutateAsync({ gameId });
      // Don't navigate here - wait for approval
      // The useEffect above will handle navigation when the request is accepted
    } catch (error) {
      console.error('Failed to join game:', error);
      // Handle error if needed
    }
  };

  const handleCancel = (gameId: string) => {
    if (window.confirm('Are you sure you want to cancel this game?')) {
      cancelMutation.mutate({ gameId });
    }
  };

  const handleLeave = (gameId: string) => {
    if (
      window.confirm(
        'Are you sure you want to leave this game? This action cannot be undone.'
      )
    ) {
      leaveMutation.mutate({ gameId });
    }
  };

  // Modified handleAcceptRequest to include navigation
  const handleAcceptRequest = async () => {
    if (joinRequest) {
      try {
        await respondToJoinRequest(
          joinRequest.gameId,
          joinRequest.requesterId,
          true
        );
        setShowAlert(false);
        // Navigate both users to the game
        navigate(`/games/${joinRequest.gameId}`);
      } catch (error) {
        console.error('Failed to accept request:', error);
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
      setShowAlert(false);
    }
  };

  // Add function to handle playing an in-progress game
  const handlePlayGame = (gameId: string) => {
    navigate(`/games/${gameId}`);
  };

  if (userLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-sm text-gray-500">Loading user data...</p>
      </div>
    );
  }

  if (userError || !currentUserId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-white border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-600 text-center">
            Error loading user data. Please refresh the page.
          </p>
        </div>
      </div>
    );
  }

  const isUserInGame = (game: any) => {
    return (
      game.creatorId === currentUserId ||
      game.opponentId === currentUserId ||
      game.pendingOpponentId === currentUserId
    );
  };

  return (
    <div className="space-y-4 max-w-2xl mx-auto min-h-screen">
      {notifications.length > 0 && (
        <div className="space-y-2">
          {notifications.map((notification, index) => (
            <div
              key={index}
              className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-blue-500" />
                <span className="text-sm text-blue-700">{notification}</span>
              </div>
              <button
                onClick={() => dismissNotification(index)}
                className="text-blue-500 hover:text-blue-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
          {notifications.length > 1 && (
            <button
              onClick={clearAllNotifications}
              className="text-xs text-gray-500 hover:text-gray-700 underline"
            >
              Clear all notifications
            </button>
          )}
        </div>
      )}

      {showAlert && joinRequest && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-80">
            <h3 className="font-semibold text-gray-900 mb-3">Join Request</h3>
            <p className="text-sm text-gray-600 mb-4">
              Player {joinRequest.requesterId.slice(0, 8)}... wants to join your
              game {joinRequest.gameId.slice(0, 8)}...
              {joinRequest.requesterName && (
                <span className="block text-xs text-gray-500 mt-1">
                  ({joinRequest.requesterName})
                </span>
              )}
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={handleRejectRequest}
                disabled={rejectMutation.isPending}
                className="px-3 py-1.5 text-sm rounded bg-gray-500 text-white hover:bg-gray-600 disabled:opacity-50 transition-colors flex items-center gap-1"
              >
                <X className="w-3 h-3" />
                {rejectMutation.isPending ? 'Rejecting...' : 'Reject'}
              </button>
              <button
                onClick={handleAcceptRequest}
                disabled={acceptMutation.isPending}
                className="px-3 py-1.5 text-sm rounded bg-green-500 text-white hover:bg-green-600 disabled:opacity-50 transition-colors flex items-center gap-1"
              >
                <Check className="w-3 h-3" />
                {acceptMutation.isPending ? 'Accepting...' : 'Accept'}
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-white border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-600 text-center">
            Error loading games: {error?.message || 'Unknown error'}
          </p>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Gamepad2 className="w-4 h-4" />
            <h3 className="font-semibold text-gray-900 text-sm">
              Active Games
            </h3>
          </div>
          <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
            {games?.length || 0}
          </span>
        </div>

        <div className="p-4">
          {loading ? (
            <p className="text-sm text-gray-500 text-center py-8">
              Loading games...
            </p>
          ) : !games || games.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">
              No active games available
            </p>
          ) : (
            <div className="space-y-3">
              {games.map((game) => (
                <div
                  key={game.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-gray-100 bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Gamepad2 className="w-4 h-4" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        Game by {game.creatorId.slice(0, 6)}...
                        {game.creatorId === currentUserId && (
                          <span className="ml-2 text-xs px-2 py-0.5 bg-blue-100 text-blue-600 rounded">
                            Your Game
                          </span>
                        )}
                        {isUserInGame(game) &&
                          game.creatorId !== currentUserId && (
                            <span className="ml-2 text-xs px-2 py-0.5 bg-green-100 text-green-600 rounded">
                              You're In
                            </span>
                          )}
                      </div>
                      <div className="text-xs text-gray-500">
                        Status: {game.status}
                        {game.status === 'IN_PROGRESS' && (
                          <span className="ml-2 text-green-600 font-medium">
                            • Playing
                          </span>
                        )}
                        {game.pendingOpponentId &&
                          game.status === 'WAITING' && (
                            <span className="ml-2 text-orange-500">
                              (Pending: {game.pendingOpponentId.slice(0, 6)}...)
                            </span>
                          )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span className="text-xs text-gray-600">
                        {Math.floor(game.timeControl / 60)} min
                      </span>
                    </div>

                    {game.isPrivate && (
                      <span className="text-xs px-2 py-0.5 bg-gray-200 text-gray-600 rounded">
                        Private
                      </span>
                    )}

                    <div className="flex items-center gap-2">
                      {game.status === 'WAITING' && (
                        <>
                          {game.creatorId !== currentUserId &&
                          !isUserInGame(game) ? (
                            <button
                              onClick={() => handleJoin(game.id)}
                              disabled={
                                joinMutation.isPending ||
                                !!game.pendingOpponentId
                              }
                              className="px-3 py-1 text-xs font-medium rounded bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 transition-colors"
                            >
                              {joinMutation.isPending
                                ? 'Requesting...'
                                : game.pendingOpponentId
                                ? 'Request Pending'
                                : 'Join'}
                            </button>
                          ) : game.creatorId === currentUserId ? (
                            <>
                              <span className="text-xs px-2 py-0.5 bg-green-100 text-green-600 rounded">
                                {game.pendingOpponentId
                                  ? 'Request Pending'
                                  : 'Waiting for players'}
                              </span>
                              <button
                                onClick={() => handleCancel(game.id)}
                                disabled={cancelMutation.isPending}
                                className="px-2 py-1 text-xs font-medium rounded bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 transition-colors flex items-center gap-1"
                                title="Cancel Game"
                              >
                                <Trash className="w-3 h-3" />
                                {cancelMutation.isPending
                                  ? 'Cancelling...'
                                  : 'Cancel'}
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => handleLeave(game.id)}
                              disabled={leaveMutation.isPending}
                              className="px-2 py-1 text-xs font-medium rounded bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50 transition-colors flex items-center gap-1"
                              title="Leave Game"
                            >
                              <LogOutIcon className="w-3 h-3" />
                              {leaveMutation.isPending ? 'Leaving...' : 'Leave'}
                            </button>
                          )}
                        </>
                      )}

                      {game.status === 'IN_PROGRESS' && (
                        <>
                          <button
                            onClick={() => handlePlayGame(game.id)}
                            className="px-3 py-1 text-xs font-medium rounded bg-purple-500 text-white hover:bg-purple-600 transition-colors"
                          >
                            Play
                          </button>
                          {isUserInGame(game) && (
                            <button
                              onClick={() => handleLeave(game.id)}
                              disabled={leaveMutation.isPending}
                              className="px-2 py-1 text-xs font-medium rounded bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 transition-colors flex items-center gap-1"
                              title="Forfeit Game"
                            >
                              <LogOutIcon className="w-3 h-3" />
                              {leaveMutation.isPending
                                ? 'Forfeiting...'
                                : 'Forfeit'}
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
