import { Gamepad2, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Badge } from '../ui/badge';
import { useGameRequests, useGames, useJoinGame } from '../../hooks/useGame';

import type { Game } from '../../types/games.type';
import { useEffect, useState } from 'react';

export const GamesList = () => {
  const currentUserId = 'YOUR_USER_ID'; // get current logged-in user
  const { data: games, isLoading: loading, error } = useGames();
  const joinMutation = useJoinGame();

  const { joinRequest, setJoinRequest } = useGameRequests(currentUserId); // listen for join requests
  const [showAlert, setShowAlert] = useState(false);

  // Show alert when a join request is received
  useEffect(() => {
    if (joinRequest) {
      setShowAlert(true);
    }
  }, [joinRequest]);

  const handleAccept = () => {
    console.log('Accepted join request', joinRequest);
    setShowAlert(false);
    setJoinRequest(null);
    // TODO: call API to add player to game
  };

  const handleDecline = () => {
    console.log('Declined join request', joinRequest);
    setShowAlert(false);
    setJoinRequest(null);
  };

  const handleJoin = (gameId: string) => {
    joinMutation.mutate({ gameId });
  };

  return (
    <div className="space-y-4">
      {/* ALERT MODAL */}
      {showAlert && joinRequest && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-xl w-80">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4">
              Join Request
            </h3>
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
              Player {joinRequest.requesterId.slice(0, 6)} wants to join game{' '}
              {joinRequest.gameId.slice(0, 6)}.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={handleDecline}
                className="px-3 py-1 text-sm rounded bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 transition-colors"
              >
                Decline
              </button>
              <button
                onClick={handleAccept}
                className="px-3 py-1 text-sm rounded bg-green-500 text-white hover:bg-green-600 transition-colors"
              >
                Accept
              </button>
            </div>
          </div>
        </div>
      )}

      {/* YOUR GAMES LIST */}
      {error && (
        <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border border-white/20 dark:border-gray-700/20 shadow-xl">
          <CardContent className="p-6">
            <p className="text-sm text-red-500 dark:text-red-400 text-center">
              Error loading games: {error?.message || 'Unknown error'}
            </p>
          </CardContent>
        </Card>
      )}

      <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border border-white/20 dark:border-gray-700/20 shadow-xl">
        {/* ...existing content (CardHeader + CardContent) */}
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center gap-2">
            <Gamepad2 className="h-5 w-5 text-gray-700 dark:text-gray-300" />
            <h3 className="font-bold text-gray-900 dark:text-white text-sm">
              Active Games
            </h3>
          </div>
          <Badge
            variant="secondary"
            className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-0"
          >
            {games?.length || 0}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-2">
          {loading ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
              Loading games...
            </p>
          ) : !games || games.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
              No active games available
            </p>
          ) : (
            games.map((game: Game) => (
              <div
                key={game.id}
                className="flex items-center justify-between p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Gamepad2 className="h-5 w-5 text-blue-500" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      Game by {game.creatorId.slice(0, 6)}...
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Status: {game.status}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  <span className="text-xs text-gray-700 dark:text-gray-300">
                    {Math.floor(game.timeControl / 60)} min
                  </span>
                  {game.isPrivate && (
                    <Badge variant="outline" className="text-xs px-1 py-0">
                      Private
                    </Badge>
                  )}
                  {game.status === 'WAITING' && (
                    <button
                      onClick={() => handleJoin(game.id)}
                      className="ml-2 px-2 py-1 text-xs font-semibold rounded bg-green-500 text-white hover:bg-green-600 transition-colors"
                      disabled={joinMutation.isLoading}
                    >
                      {joinMutation.isLoading ? 'Joining...' : 'Join'}
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};
