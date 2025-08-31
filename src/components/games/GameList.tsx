import {
  ClockIcon,
  GamepadIcon,
  XIcon,
  CheckIcon,
  AlertCircleIcon,
} from 'lucide-react';
import {
  useGetGames,
  useJoinGame,
  useGameRequests,
  useAcceptOpponent,
  useRejectOpponent,
} from '../../hooks/useGame';

import { useState, useEffect } from 'react';
import { useCurrentUser } from '../../hooks/useAuth';

export default function GamesList() {
  // Get real current user instead of hardcoded ID
  const {
    data: currentUser,
    isLoading: userLoading,
    error: userError,
  } = useCurrentUser();
  const currentUserId = currentUser?.id;

  const joinMutation = useJoinGame();
  const acceptMutation = useAcceptOpponent();
  const rejectMutation = useRejectOpponent();
  const { data: games, isLoading: loading, error } = useGetGames();

  // Only setup game requests if we have a valid user ID
  const {
    joinRequest,
    setJoinRequest,
    respondToJoinRequest,
    notifications,
    dismissNotification,
    clearAllNotifications,
  } = useGameRequests(currentUserId || '');

  const [showAlert, setShowAlert] = useState(false);

  // Debug: Log current user ID and component mount
  useEffect(() => {
    if (currentUserId) {
      console.log('GamesList mounted with currentUserId:', currentUserId);
    }
  }, [currentUserId]);

  useEffect(() => {
    console.log('joinRequest changed:', joinRequest);
    if (joinRequest) {
      console.log('Join request received in component:', joinRequest);
      setShowAlert(true);
    } else {
      console.log('No join request, hiding alert');
      setShowAlert(false);
    }
  }, [joinRequest]);

  const handleJoin = (gameId: string) => {
    console.log('Attempting to join game:', gameId);
    joinMutation.mutate({ gameId });
  };

  const handleAcceptRequest = async () => {
    console.log('Accepting request:', joinRequest);
    if (joinRequest) {
      await respondToJoinRequest(
        joinRequest.gameId,
        joinRequest.requesterId,
        true
      );
      setShowAlert(false);
    }
  };

  const handleRejectRequest = async () => {
    console.log('Rejecting request:', joinRequest);
    if (joinRequest) {
      await respondToJoinRequest(
        joinRequest.gameId,
        joinRequest.requesterId,
        false
      );
      setShowAlert(false);
    }
  };

  // Show loading state while user data is loading
  if (userLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-sm text-gray-500">Loading user data...</p>
      </div>
    );
  }

  // Show error if user couldn't be loaded
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

  return (
    <div className="space-y-4 max-w-2xl mx-auto min-h-screen">
      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="space-y-2">
          {notifications.map((notification, index) => (
            <div
              key={index}
              className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <AlertCircleIcon className="w-4 h-4 text-blue-500" />
                <span className="text-sm text-blue-700">{notification}</span>
              </div>
              <button
                onClick={() => dismissNotification(index)}
                className="text-blue-500 hover:text-blue-700 p-1"
              >
                <XIcon className="w-4 h-4" />
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

      {/* Debug info - Remove in production */}
      <div className="bg-yellow-100 p-2 rounded text-xs">
        <div>Current User: {currentUserId}</div>
        <div>
          User Name: {currentUser?.name || currentUser?.email || 'Unknown'}
        </div>
        <div>Show Alert: {showAlert ? 'YES' : 'NO'}</div>
        <div>
          Join Request: {joinRequest ? JSON.stringify(joinRequest) : 'None'}
        </div>
        <div>Notifications: {notifications.length}</div>
      </div>

      {/* Alert for owner */}
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
                disabled={rejectMutation.isLoading}
                className="px-3 py-1.5 text-sm rounded bg-gray-500 text-white hover:bg-gray-600 disabled:opacity-50 transition-colors flex items-center gap-1"
              >
                <XIcon className="w-3 h-3" />
                {rejectMutation.isLoading ? 'Rejecting...' : 'Reject'}
              </button>
              <button
                onClick={handleAcceptRequest}
                disabled={acceptMutation.isLoading}
                className="px-3 py-1.5 text-sm rounded bg-green-500 text-white hover:bg-green-600 disabled:opacity-50 transition-colors flex items-center gap-1"
              >
                <CheckIcon className="w-3 h-3" />
                {acceptMutation.isLoading ? 'Accepting...' : 'Accept'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-white border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-600 text-center">
            Error loading games: {error?.message || 'Unknown error'}
          </p>
        </div>
      )}

      {/* Games list */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <GamepadIcon className="w-4 h-4" />
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
                    <GamepadIcon className="w-4 h-4" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        Game by {game.creatorId.slice(0, 6)}...
                        {game.creatorId === currentUserId && (
                          <span className="ml-2 text-xs px-2 py-0.5 bg-blue-100 text-blue-600 rounded">
                            Your Game
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
                      <ClockIcon className="w-3 h-3" />
                      <span className="text-xs text-gray-600">
                        {Math.floor(game.timeControl / 60)} min
                      </span>
                    </div>

                    {game.isPrivate && (
                      <span className="text-xs px-2 py-0.5 bg-gray-200 text-gray-600 rounded">
                        Private
                      </span>
                    )}

                    {game.status === 'WAITING' && (
                      <>
                        {game.creatorId !== currentUserId ? (
                          <button
                            onClick={() => handleJoin(game.id)}
                            disabled={
                              joinMutation.isLoading || !!game.pendingOpponentId
                            }
                            className="px-3 py-1 text-xs font-medium rounded bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 transition-colors"
                          >
                            {joinMutation.isLoading
                              ? 'Joining...'
                              : game.pendingOpponentId
                              ? 'Request Pending'
                              : 'Join'}
                          </button>
                        ) : (
                          <span className="text-xs px-2 py-0.5 bg-green-100 text-green-600 rounded">
                            {game.pendingOpponentId
                              ? 'Request Pending'
                              : 'Waiting for players'}
                          </span>
                        )}
                      </>
                    )}

                    {game.status === 'IN_PROGRESS' && (
                      <button className="px-3 py-1 text-xs font-medium rounded bg-purple-500 text-white hover:bg-purple-600 transition-colors">
                        Play
                      </button>
                    )}
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
