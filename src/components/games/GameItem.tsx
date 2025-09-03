import { Clock, Trash, LogOutIcon } from 'lucide-react';

export function GameItem({
  game,
  currentUserId,
  onJoin,
  onCancel,
  onLeave,
  onPlay,
  joinMutation,
  cancelMutation,
  leaveMutation,
}: any) {
  const isUserInGame = () => {
    return (
      game.creatorId === currentUserId ||
      game.opponentId === currentUserId ||
      game.pendingOpponentId === currentUserId
    );
  };

  const isCreator = game.creatorId === currentUserId;
  const canJoin = game.status === 'WAITING' && !isCreator && !isUserInGame();
  const isInProgress = game.status === 'IN_PROGRESS';

  return (
    <div className="flex items-center justify-between p-2 rounded-md border border-gray-100 bg-gray-50 hover:bg-gray-100 transition-colors">
      <div className="flex-1 min-w-0">
        <div className="text-xs font-medium text-gray-900">
          Game {game.id.slice(0, 8)}...
          {isCreator && (
            <span className="ml-1 text-xs px-1.5 py-0.5 bg-blue-100 text-blue-600 rounded">
              Your Game
            </span>
          )}
          {isUserInGame() && !isCreator && (
            <span className="ml-1 text-xs px-1.5 py-0.5 bg-green-100 text-green-600 rounded">
              Joined
            </span>
          )}
        </div>
        <div className="text-xs text-gray-500">
          {game.status} {game.pendingOpponentId && '(Pending)'}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          <Clock className="w-2.5 h-2.5" />
          <span className="text-xs text-gray-600">
            {Math.floor(game.timeControl / 60)}m
          </span>
        </div>

        {game.isPrivate && (
          <span className="text-xs px-1.5 py-0.5 bg-gray-200 text-gray-600 rounded">
            Private
          </span>
        )}

        <div className="flex items-center gap-1">
          {canJoin && (
            <button
              onClick={() => onJoin(game.id)}
              disabled={joinMutation.isPending || !!game.pendingOpponentId}
              className="px-2 py-1 text-xs font-medium rounded bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 transition-colors"
            >
              {joinMutation.isPending
                ? 'Joining...'
                : game.pendingOpponentId
                ? 'Pending'
                : 'Join'}
            </button>
          )}

          {game.status === 'WAITING' && isCreator && (
            <button
              onClick={() => onCancel(game.id)}
              disabled={cancelMutation.isPending}
              className="px-1.5 py-1 text-xs font-medium rounded bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 transition-colors flex items-center gap-1"
              title="Cancel Game"
            >
              <Trash className="w-2.5 h-2.5" />
              {cancelMutation.isPending ? 'Cancelling...' : 'Cancel'}
            </button>
          )}

          {isInProgress && (
            <>
              <button
                onClick={() => onPlay(game.id)}
                className="px-2 py-1 text-xs font-medium rounded bg-green-500 text-white hover:bg-green-600 transition-colors"
              >
                Play
              </button>
              {isUserInGame() && (
                <button
                  onClick={() => onLeave(game.id)}
                  disabled={leaveMutation.isPending}
                  className="px-1.5 py-1 text-xs font-medium rounded bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 transition-colors flex items-center gap-1"
                  title="Forfeit"
                >
                  <LogOutIcon className="w-2.5 h-2.5" />
                  {leaveMutation.isPending ? 'Forfeiting...' : 'Forfeit'}
                </button>
              )}
            </>
          )}

          {game.status === 'WAITING' && !isCreator && isUserInGame() && (
            <button
              onClick={() => onLeave(game.id)}
              disabled={leaveMutation.isPending}
              className="px-1.5 py-1 text-xs font-medium rounded bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50 transition-colors flex items-center gap-1"
              title="Leave"
            >
              <LogOutIcon className="w-2.5 h-2.5" />
              {leaveMutation.isPending ? 'Leaving...' : 'Leave'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
