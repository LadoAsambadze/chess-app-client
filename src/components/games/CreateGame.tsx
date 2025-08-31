import { useState } from 'react';
import {
  Clock,
  Lock,
  Gamepad2,
  Zap,
  Loader2,
  Timer,
  Globe,
  Shield,
  Users,
  Key,
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Alert, AlertDescription } from '../ui/alert';
import { useCreateGame } from '../../hooks/useGame';
import { Button } from '../ui/Button';

const timePresets = [
  { label: '1 min', value: 60 },
  { label: '3 min', value: 180 },
  { label: '5 min', value: 300 },
  { label: '10 min', value: 600 },
  { label: '15 min', value: 900 },
  { label: '30 min', value: 1800 },
];

const formatTime = (sec: number) =>
  sec >= 60
    ? `${Math.floor(sec / 60)}:${(sec % 60).toString().padStart(2, '0')}`
    : `${sec}s`;

function TimePresetButton({
  preset,
  isSelected,
  onClick,
}: {
  preset: (typeof timePresets)[0];
  isSelected: boolean;
  onClick: () => void;
}) {
  const baseClasses =
    'h-12 rounded-lg font-medium transition-all duration-200 hover:scale-105';
  const selectedClasses = 'bg-blue-500 text-white shadow-md';
  const unselectedClasses =
    'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600';

  return (
    <Button
      onClick={onClick}
      className={`${baseClasses} ${
        isSelected ? selectedClasses : unselectedClasses
      }`}
    >
      <div className="flex flex-col items-center">
        <span className="text-sm font-medium">{preset.label}</span>
        <Clock className="h-3 w-3 mt-1 opacity-70" />
      </div>
    </Button>
  );
}

function PrivacyOption({
  isPrivate: optionIsPrivate,
  isSelected,
  onClick,
}: {
  isPrivate: boolean;
  isSelected: boolean;
  onClick: () => void;
}) {
  const config = optionIsPrivate
    ? {
        title: 'Private Game',
        description: 'Password protected',
        icon: Shield,
        secondaryIcon: Lock,
      }
    : {
        title: 'Public Game',
        description: 'Open to all players',
        icon: Globe,
        secondaryIcon: Users,
      };

  const MainIcon = config.icon;
  const SecondaryIcon = config.secondaryIcon;

  return (
    <div
      onClick={onClick}
      className={`cursor-pointer p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md ${
        isSelected
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="relative p-2 bg-blue-500 rounded-lg">
            <MainIcon className="h-4 w-4 text-white" />
            <div className="absolute -top-1 -right-1 p-1 bg-white dark:bg-gray-800 rounded-md">
              <SecondaryIcon className="h-2 w-2 text-gray-600 dark:text-gray-400" />
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              {config.title}
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {config.description}
            </p>
          </div>
        </div>

        <div
          className={`p-1.5 rounded-full transition-all duration-200 ${
            isSelected ? 'bg-blue-500' : 'bg-gray-200 dark:bg-gray-600'
          }`}
        >
          <div
            className={`w-2 h-2 rounded-full ${
              isSelected ? 'bg-white' : 'bg-gray-400 dark:bg-gray-500'
            }`}
          ></div>
        </div>
      </div>
    </div>
  );
}

export function CreateGame() {
  const [timeControl, setTimeControl] = useState(600);
  const [isPrivate, setIsPrivate] = useState(false);
  const [password, setPassword] = useState('');
  const createGameMutation = useCreateGame();

  const handleCreateGame = () => {
    createGameMutation.mutate(
      {
        timeControl,
        isPrivate,
        password: isPrivate ? password : undefined,
      },
      {
        onSuccess: () => console.log('Game created successfully'),
        onError: (error) => console.error(error),
      }
    );
  };

  return (
    <Card className="w-full max-w-2xl mx-auto bg-white dark:bg-gray-900 shadow-lg rounded-xl">
      <CardHeader className="bg-blue-50 dark:bg-blue-950/50 border-b border-blue-100 dark:border-blue-800 p-6">
        <div className="flex items-center gap-3">
          <div className="bg-blue-500 p-2 rounded-lg">
            <Gamepad2 className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Create New Game
            </h2>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Time Control Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Timer className="h-4 w-4 text-blue-500" />
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                  Time Control
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Choose your game duration
                </p>
              </div>
            </div>
            <Badge
              variant="secondary"
              className="text-sm font-mono px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
            >
              {formatTime(timeControl)}
            </Badge>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {timePresets.map((preset) => (
              <TimePresetButton
                key={preset.value}
                preset={preset}
                isSelected={timeControl === preset.value}
                onClick={() => setTimeControl(preset.value)}
              />
            ))}
          </div>
        </section>

        {/* Privacy Settings */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-blue-500" />
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                Game Privacy
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Choose who can join your game
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            <PrivacyOption
              isPrivate={false}
              isSelected={!isPrivate}
              onClick={() => setIsPrivate(false)}
            />
            <PrivacyOption
              isPrivate={true}
              isSelected={isPrivate}
              onClick={() => setIsPrivate(true)}
            />
          </div>

          {/* Password Input */}
          {isPrivate && (
            <div className="space-y-3 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2">
                <Key className="h-3 w-3 text-blue-500" />
                <div>
                  <label className="text-xs font-medium text-gray-900 dark:text-white">
                    Game Password
                  </label>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Share this password with players
                  </p>
                </div>
              </div>
              <Input
                type="password"
                placeholder="Enter password..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-9 bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-700 rounded-md focus:border-blue-400 focus:ring-blue-400/20"
              />
            </div>
          )}
        </section>

        {/* Create Game Button */}
        <Button
          onClick={handleCreateGame}
          disabled={
            createGameMutation.isPending || (isPrivate && !password.trim())
          }
          className="w-full h-12 text-base font-semibold bg-blue-500 hover:bg-blue-600 text-white shadow-md rounded-lg transition-all duration-200 hover:shadow-lg disabled:opacity-50"
        >
          <div className="flex items-center justify-center">
            {createGameMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Game...
              </>
            ) : (
              <>
                <Zap className="mr-2 h-4 w-4" />
                Create Game
              </>
            )}
          </div>
        </Button>

        {/* Error Alert */}
        {createGameMutation.isError && (
          <Alert
            variant="destructive"
            className="bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800 rounded-lg"
          >
            <AlertDescription className="text-red-800 dark:text-red-200 text-sm">
              {createGameMutation.error?.message ||
                'Something went wrong. Please try again.'}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
