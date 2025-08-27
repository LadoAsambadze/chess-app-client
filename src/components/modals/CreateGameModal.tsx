import { useState, useMemo } from 'react';
import {
  Clock,
  Lock,
  Unlock,
  Gamepad2,
  Zap,
  Loader2,
  Sparkles,
  Timer,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Badge } from '../ui/badge';
import { Slider } from '../ui/slider';
import { Input } from '../ui/input';
import { Switch } from '../ui/switch';
import { Alert, AlertDescription } from '../ui/alert';
import { useCreateGame } from '../../hooks/useGame';

const timePresets = [
  { label: '1 min', value: 60, color: 'from-red-500 to-orange-500' },
  { label: '3 min', value: 180, color: 'from-orange-500 to-amber-500' },
  { label: '5 min', value: 300, color: 'from-amber-500 to-yellow-500' },
  { label: '10 min', value: 600, color: 'from-green-500 to-emerald-500' },
  { label: '15 min', value: 900, color: 'from-blue-500 to-cyan-500' },
  { label: '30 min', value: 1800, color: 'from-purple-500 to-indigo-500' },
];

const formatTime = (sec: number) =>
  sec >= 60
    ? `${Math.floor(sec / 60)}:${(sec % 60).toString().padStart(2, '0')}`
    : `${sec}s`;

// Compact preset button for reusability
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
    'relative h-16 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105';
  const selectedClasses = `bg-gradient-to-r ${preset.color} text-white shadow-xl scale-105`;
  const unselectedClasses =
    'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 shadow-md hover:shadow-lg';

  return (
    <Button
      onClick={onClick}
      className={`${baseClasses} ${
        isSelected ? selectedClasses : unselectedClasses
      }`}
    >
      <div className="flex flex-col items-center">
        <span className="text-sm font-bold">{preset.label}</span>
        <Clock className="h-4 w-4 mt-1 opacity-70" />
      </div>
      {isSelected && (
        <div className="absolute inset-0 rounded-2xl bg-white/20 animate-pulse"></div>
      )}
    </Button>
  );
}

export function CreateGameComponent() {
  const [timeControl, setTimeControl] = useState(600);
  const [isPrivate, setIsPrivate] = useState(false);
  const [password, setPassword] = useState('');
  const createGameMutation = useCreateGame();

  const selectedPreset = useMemo(
    () => timePresets.find((preset) => preset.value === timeControl),
    [timeControl]
  );

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

  const privacyColors = useMemo(() => {
    if (isPrivate) {
      return {
        border: 'border-red-200 dark:border-red-800',
        bg: 'from-red-50 to-pink-50 dark:from-red-950/30 dark:to-pink-950/30 hover:from-red-100 hover:to-pink-100 dark:hover:from-red-950/50 dark:hover:to-pink-950/50',
        glow: 'bg-gradient-to-r from-red-400 to-pink-400',
        iconBg:
          'bg-gradient-to-r from-red-500 to-pink-500 shadow-lg shadow-red-500/30',
        iconColor: 'text-white',
        textColor: 'text-gray-900 dark:text-white',
      };
    }
    return {
      border: 'border-green-200 dark:border-green-800',
      bg: 'from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 hover:from-green-100 hover:to-emerald-100 dark:hover:from-green-950/50 dark:hover:to-emerald-950/50',
      glow: 'bg-gradient-to-r from-green-400 to-emerald-400',
      iconBg:
        'bg-gradient-to-r from-green-500 to-emerald-500 shadow-lg shadow-green-500/30',
      iconColor: 'text-white',
      textColor: 'text-gray-900 dark:text-white',
    };
  }, [isPrivate]);

  return (
    <Card className="w-full backdrop-blur-sm bg-white/90 dark:bg-gray-900/90 border border-white/20 dark:border-gray-700/20 shadow-2xl shadow-blue-500/20 rounded-3xl overflow-hidden">
      <CardHeader className="relative bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 border-b border-blue-100/50 dark:border-blue-800/50 p-8">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-400/10 to-transparent rounded-bl-full"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-indigo-400/10 to-transparent rounded-tr-full"></div>

        <div className="relative flex items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur opacity-75 animate-pulse"></div>
            <div className="relative bg-gradient-to-r from-blue-500 to-indigo-600 p-4 rounded-2xl">
              <Gamepad2 className="h-8 w-8 text-white" />
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-blue-800 dark:from-white dark:to-blue-200 bg-clip-text text-transparent">
              Create New Game
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              Set your preferences and start playing
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-8 space-y-10">
        {/* Time Control Section */}
        <section className="space-y-6">
          <header className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl">
                <Timer className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Time Control
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Choose your game duration
                </p>
              </div>
            </div>
            <Badge
              variant="secondary"
              className={`text-xl font-mono px-4 py-2 ${
                selectedPreset
                  ? `bg-gradient-to-r ${selectedPreset.color} text-white border-0 shadow-lg`
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
              }`}
            >
              {formatTime(timeControl)}
            </Badge>
          </header>

          {/* Time Presets */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {timePresets.map((preset) => (
              <TimePresetButton
                key={preset.value}
                preset={preset}
                isSelected={timeControl === preset.value}
                onClick={() => setTimeControl(preset.value)}
              />
            ))}
          </div>

          {/* Time Slider */}
          <div className="space-y-4 p-6 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/30 rounded-2xl border border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Fine-tune your time
              </span>
            </div>
            <Slider
              value={[timeControl]}
              onValueChange={(value) => setTimeControl(value[0])}
              min={60}
              max={3600}
              step={60}
              className="w-full [&_[role=slider]]:bg-gradient-to-r [&_[role=slider]]:from-blue-500 [&_[role=slider]]:to-indigo-500 [&_[role=slider]]:border-0 [&_[role=slider]]:shadow-lg"
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 font-medium">
              <span>1 min</span>
              <span className="text-blue-600 dark:text-blue-400 font-semibold">
                {formatTime(timeControl)}
              </span>
              <span>60 min</span>
            </div>
          </div>
        </section>

        {/* Privacy Settings */}
        <section
          className={`relative group cursor-pointer p-6 rounded-2xl border-2 transition-all duration-300 ${privacyColors.border} ${privacyColors.bg}`}
          onClick={() => setIsPrivate((prev) => !prev)}
        >
          {/* Glow effect */}
          <div
            className={`absolute inset-0 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity ${privacyColors.glow}`}
          ></div>

          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`${privacyColors.iconBg} p-3 rounded-2xl`}>
                {isPrivate ? (
                  <Lock className={`h-6 w-6 ${privacyColors.iconColor}`} />
                ) : (
                  <Unlock className={`h-6 w-6 ${privacyColors.iconColor}`} />
                )}
              </div>
              <div>
                <h3 className={`text-xl font-bold ${privacyColors.textColor}`}>
                  {isPrivate ? 'Private Game' : 'Public Game'}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">
                  {isPrivate
                    ? 'Requires password to join'
                    : 'Anyone can join your game'}
                </p>
              </div>
            </div>
            <Switch
              checked={isPrivate}
              onCheckedChange={setIsPrivate}
              className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-red-500 data-[state=checked]:to-pink-500"
            />
          </div>

          {/* Password Input */}
          {isPrivate && (
            <div className="space-y-3 animate-in slide-in-from-top-4 duration-300 mt-6">
              <label className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white">
                <Lock className="h-4 w-4 text-red-500" />
                Game Password
              </label>
              <Input
                type="password"
                placeholder="Enter a secure password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-red-400 focus:ring-red-400/20 text-lg"
              />
            </div>
          )}
        </section>

        {/* Create Game Button */}
        <div className="relative">
          <Button
            onClick={handleCreateGame}
            disabled={
              createGameMutation.isPending || (isPrivate && !password.trim())
            }
            className="relative w-full h-16 text-xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white shadow-2xl shadow-blue-500/30 rounded-2xl transition-all duration-300 transform hover:scale-105 disabled:transform-none disabled:opacity-50"
          >
            {/* Button glow effect */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-400 to-purple-400 blur opacity-30 animate-pulse"></div>

            <div className="relative flex items-center justify-center">
              {createGameMutation.isPending ? (
                <>
                  <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                  Creating Game...
                </>
              ) : (
                <>
                  <Zap className="mr-3 h-6 w-6" />
                  Create Game
                </>
              )}
            </div>
          </Button>
        </div>

        {/* Error Alert */}
        {createGameMutation.isError && (
          <Alert
            variant="destructive"
            className="animate-in slide-in-from-top-4 duration-300 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-950/30 dark:to-pink-950/30 border-red-200 dark:border-red-800 rounded-2xl"
          >
            <AlertDescription className="text-red-800 dark:text-red-200 font-medium">
              {createGameMutation.error?.message ||
                'Something went wrong. Please try again.'}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
