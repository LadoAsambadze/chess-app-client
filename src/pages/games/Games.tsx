'use client';

import { Trophy } from 'lucide-react';
import { CreateGameComponent } from '../../components/modals/CreateGameModal';
import { Card, CardHeader } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { GamesList } from '../../components/modals/GameList';

export function Games() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-blue-950 dark:to-indigo-950">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-400/20 to-cyan-600/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-violet-400/10 to-pink-600/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 container mx-auto p-4 lg:p-8 xl:p-12">
        {/* Main Layout Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-8 lg:gap-12">
          {/* Main Content Area - 80% */}
          <div className="xl:col-span-4 space-y-6">
            <div className="relative">
              {/* Glow effect behind create game component */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-3xl blur-xl transform scale-105"></div>
              <div className="relative">
                <CreateGameComponent />
              </div>
            </div>
          </div>

          {/* Enhanced Sidebar - 20% */}
          <div className="xl:col-span-1 space-y-6">
            <div className="sticky top-8">
              <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border border-white/20 dark:border-gray-700/20 shadow-2xl shadow-blue-500/10">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg">
                        <Trophy className="h-4 w-4 text-white" />
                      </div>
                      <h3 className="font-bold text-gray-900 dark:text-white text-sm">
                        Active Games
                      </h3>
                    </div>
                    <Badge
                      variant="secondary"
                      className="bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 text-gray-700 dark:text-gray-300 border-0 shadow-sm"
                    >
                      0
                    </Badge>
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
