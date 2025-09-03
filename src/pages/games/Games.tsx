import { CreateGame } from '../../components/games/CreateGame';
import { GamesList } from '../../components/games/GameList';
import { UserRanking } from '../../components/games/UserRanking';

export function Games() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-3">
            <div className="sticky top-6">
              <UserRanking />
            </div>
          </div>
          <div className="lg:col-span-6">
            <CreateGame />
          </div>
          <div className="lg:col-span-3">
            <div className="sticky top-6">
              <GamesList />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
