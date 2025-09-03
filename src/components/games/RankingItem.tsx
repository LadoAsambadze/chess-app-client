import { Crown, Medal, Star, User, Zap } from 'lucide-react';

export function RankingItem({ player, isCurrentUser = false }: any) {
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-3 w-3 text-yellow-500" />;
      case 2:
        return <Medal className="h-3 w-3 text-gray-400" />;
      case 3:
        return <Medal className="h-3 w-3 text-amber-600" />;
      default:
        return <Star className="h-3 w-3 text-blue-500" />;
    }
  };

  const getRankBg = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-yellow-500';
      case 2:
        return 'bg-gray-400';
      case 3:
        return 'bg-amber-600';
      default:
        return 'bg-blue-500';
    }
  };

  return (
    <div
      className={`p-2 rounded-md transition-colors ${
        isCurrentUser
          ? 'bg-blue-50 border border-blue-200'
          : 'bg-gray-50 hover:bg-gray-100'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center ${getRankBg(
              player.rank
            )}`}
          >
            <span className="text-xs font-bold text-white">{player.rank}</span>
          </div>

          <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <User className="h-3 w-3 text-white" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1">
              <span className="text-xs font-medium text-gray-900 truncate">
                {player.username}
              </span>
              {isCurrentUser && (
                <span className="text-xs px-1 py-0.5 bg-blue-100 text-blue-700 rounded">
                  You
                </span>
              )}
            </div>
            <div className="text-xs text-gray-500">
              {player.rating} • {player.winRate}%
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-0.5">
          {getRankIcon(player.rank)}
          {player.streak > 0 && (
            <div className="flex items-center gap-0.5 text-xs text-green-600">
              <Zap className="h-2.5 w-2.5" />
              <span>{player.streak}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
