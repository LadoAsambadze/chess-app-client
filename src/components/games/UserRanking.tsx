import { Trophy, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../../components/ui/card';
import { RankingItem } from './RankingItem';

const mockRankings = [
  {
    id: '1',
    username: 'ChessMaster2024',
    rating: 2847,
    rank: 1,
    gamesPlayed: 342,
    winRate: 87.3,
    streak: 12,
  },
  {
    id: '2',
    username: 'QueenSlayer',
    rating: 2734,
    rank: 2,
    gamesPlayed: 298,
    winRate: 83.1,
    streak: 8,
  },
  {
    id: '3',
    username: 'KnightRider',
    rating: 2689,
    rank: 3,
    gamesPlayed: 267,
    winRate: 79.8,
    streak: 5,
  },
  {
    id: '4',
    username: 'PawnStorm',
    rating: 2634,
    rank: 4,
    gamesPlayed: 423,
    winRate: 76.2,
    streak: 3,
  },
  {
    id: '5',
    username: 'RookMover',
    rating: 2598,
    rank: 5,
    gamesPlayed: 189,
    winRate: 74.6,
    streak: 7,
  },
];

export function UserRanking() {
  return (
    <Card className="bg-white border border-gray-200 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1 bg-purple-500 rounded-md">
              <Trophy className="h-3.5 w-3.5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm">Leaderboard</h3>
              <p className="text-xs text-gray-500">Top players</p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs text-purple-600">
            <TrendingUp className="h-3 w-3" />
            <span>Live</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-3 space-y-1.5 max-h-80 overflow-y-auto">
        {mockRankings.map((player) => (
          <RankingItem
            key={player.id}
            player={player}
            isCurrentUser={player.rank === 4}
          />
        ))}

        <div className="pt-2 border-t border-gray-200">
          <button className="w-full text-xs text-purple-600 hover:text-purple-700 font-medium transition-colors">
            View Full Rankings →
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
