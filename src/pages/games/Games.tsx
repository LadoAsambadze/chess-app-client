import {
  Trophy,
  Crown,
  Medal,
  Star,
  User,
  Zap,
  TrendingUp,
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '../../components/ui/card';
import { CreateGame } from '../../components/games/CreateGame';
import GamesList from '../../components/games/GameList';

const mockRankings = [
  {
    id: '1',
    username: 'ChessMaster2024',
    rating: 2847,
    rank: 1,
    gamesPlayed: 342,
    winRate: 87.3,
    streak: 12,
    avatar: null,
  },
  {
    id: '2',
    username: 'QueenSlayer',
    rating: 2734,
    rank: 2,
    gamesPlayed: 298,
    winRate: 83.1,
    streak: 8,
    avatar: null,
  },
  {
    id: '3',
    username: 'KnightRider',
    rating: 2689,
    rank: 3,
    gamesPlayed: 267,
    winRate: 79.8,
    streak: 5,
    avatar: null,
  },
  {
    id: '4',
    username: 'PawnStorm',
    rating: 2634,
    rank: 4,
    gamesPlayed: 423,
    winRate: 76.2,
    streak: 3,
    avatar: null,
  },
  {
    id: '5',
    username: 'RookMover',
    rating: 2598,
    rank: 5,
    gamesPlayed: 189,
    winRate: 74.6,
    streak: 7,
    avatar: null,
  },
  {
    id: '6',
    username: 'BishopBender',
    rating: 2567,
    rank: 6,
    gamesPlayed: 356,
    winRate: 72.1,
    streak: 2,
    avatar: null,
  },
  {
    id: '7',
    username: 'CastleKeeper',
    rating: 2534,
    rank: 7,
    gamesPlayed: 234,
    winRate: 69.8,
    streak: 4,
    avatar: null,
  },
];

function RankingItem({ player, isCurrentUser = false }) {
  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Crown className="h-4 w-4 text-yellow-500" />;
      case 2:
        return <Medal className="h-4 w-4 text-gray-400" />;
      case 3:
        return <Medal className="h-4 w-4 text-amber-600" />;
      default:
        return <Star className="h-4 w-4 text-blue-500" />;
    }
  };

  const getRankBg = (rank) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-500 to-amber-500';
      case 2:
        return 'bg-gradient-to-r from-gray-400 to-gray-500';
      case 3:
        return 'bg-gradient-to-r from-amber-600 to-orange-500';
      default:
        return 'bg-gradient-to-r from-blue-500 to-indigo-500';
    }
  };

  return (
    <div
      className={`p-3 rounded-lg transition-all duration-200 hover:shadow-md ${
        isCurrentUser
          ? 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200 dark:border-blue-700'
          : 'bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700/50'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-1.5 rounded-full ${getRankBg(player.rank)}`}>
            <span className="text-xs font-bold text-white">#{player.rank}</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-900 dark:text-white truncate max-w-24">
                  {player.username}
                </span>
                {isCurrentUser && (
                  <div className="text-xs px-1.5 py-0.5">You</div>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <span>{player.rating} ELO</span>
                <span>•</span>
                <span>{player.winRate}% WR</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1">
          {getRankIcon(player.rank)}
          {player.streak > 0 && (
            <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
              <Zap className="h-3 w-3" />
              <span>{player.streak}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function UserRanking() {
  return (
    <Card className="backdrop-blur-sm bg-white/90 dark:bg-gray-900/90 border border-white/20 dark:border-gray-700/20 shadow-2xl shadow-purple-500/10">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
              <Trophy className="h-4 w-4 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white text-sm">
                Leaderboard
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Top players this season
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs text-purple-600 dark:text-purple-400">
            <TrendingUp className="h-3 w-3" />
            <span>Live</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-2 max-h-96 overflow-y-auto">
        {mockRankings.map((player, index) => (
          <RankingItem
            key={player.id}
            player={player}
            isCurrentUser={player.rank === 4} // Mock current user at rank 4
          />
        ))}

        <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
          <button className="w-full text-xs text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium transition-colors">
            View Full Rankings →
          </button>
        </div>
      </CardContent>
    </Card>
  );
}

export function Games() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-blue-950 dark:to-indigo-950">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-400/20 to-cyan-600/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-violet-400/10 to-pink-600/10 rounded-full blur-3xl"></div>
        <div className="absolute -top-20 left-1/4 w-60 h-60 bg-gradient-to-br from-emerald-400/15 to-teal-600/15 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Three Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* User Ranking - Left Sidebar (25%) */}
          <div className="lg:col-span-3 space-y-6">
            <div className="sticky top-8">
              <UserRanking />
            </div>
          </div>

          {/* Create Game - Main Content (50%) */}
          <div className="lg:col-span-6 space-y-6">
            <div className="relative">
              {/* Glow effect behind create game component */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-3xl blur-xl transform scale-105"></div>
              <div className="relative">
                <CreateGame />
              </div>
            </div>
          </div>

          {/* Games List - Right Sidebar (25%) */}
          <div className="lg:col-span-3 space-y-6">
            <div className="sticky top-8">
              <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border border-white/20 dark:border-gray-700/20 shadow-2xl shadow-blue-500/10">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg">
                        <Trophy className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white text-sm">
                          Active Games
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Join or create games
                        </p>
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 text-gray-700 dark:text-gray-300 border-0 shadow-sm">
                      0
                    </div>
                  </div>
                </CardHeader>
                <GamesList />
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
