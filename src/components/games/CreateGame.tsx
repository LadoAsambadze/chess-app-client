import { useState } from 'react';
import { Gamepad2, Timer, Shield, Key, Zap, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Alert, AlertDescription } from '../ui/alert';
import { useCreateGame } from '../../hooks/useGame';
import { Button } from '../ui/Button';
import { TimePresetButton } from './TimePressButton';
import { PrivacyOption } from './PrivaciOption';

const timePresets = [
  { label: '1m', value: 60 },
  { label: '3m', value: 180 },
  { label: '5m', value: 300 },
  { label: '10m', value: 600 },
  { label: '15m', value: 900 },
  { label: '30m', value: 1800 },
];

const formatTime = (sec: number) =>
  sec >= 60
    ? `${Math.floor(sec / 60)}:${(sec % 60).toString().padStart(2, '0')}`
    : `${sec}s`;

export function CreateGame() {
  const [timeControl, setTimeControl] = useState(600);
  const [isPrivate, setIsPrivate] = useState(false);
  const [password, setPassword] = useState('');
  const createGameMutation = useCreateGame();

  const handleCreateGame = () => {
    createGameMutation.mutate({
      timeControl,
      isPrivate,
      password: isPrivate ? password : undefined,
    });
  };

  return (
    <Card className="w-full bg-white shadow-md rounded-lg">
      <CardHeader className="bg-blue-50 border-b border-blue-100 p-4">
        <div className="flex items-center gap-2">
          <div className="bg-blue-500 p-1.5 rounded-md">
            <Gamepad2 className="h-4 w-4 text-white" />
          </div>
          <h2 className="text-lg font-bold text-gray-900">Create New Game</h2>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        {/* Time Control */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Timer className="h-3.5 w-3.5 text-blue-500" />
              <div>
                <h3 className="text-sm font-semibold text-gray-900">
                  Time Control
                </h3>
                <p className="text-xs text-gray-500">Game duration</p>
              </div>
            </div>
            <Badge className="text-xs font-mono bg-blue-100 text-blue-800">
              {formatTime(timeControl)}
            </Badge>
          </div>

          <div className="grid grid-cols-3 gap-2">
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
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Shield className="h-3.5 w-3.5 text-blue-500" />
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Privacy</h3>
              <p className="text-xs text-gray-500">Who can join</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
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

          {isPrivate && (
            <div className="space-y-2 p-3 bg-blue-50 rounded-md border border-blue-200">
              <div className="flex items-center gap-2">
                <Key className="h-3 w-3 text-blue-500" />
                <label className="text-xs font-medium text-gray-900">
                  Password
                </label>
              </div>
              <Input
                type="password"
                placeholder="Enter password..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-8 text-xs"
              />
            </div>
          )}
        </section>

        {/* Create Button */}
        <Button
          onClick={handleCreateGame}
          disabled={
            createGameMutation.isPending || (isPrivate && !password.trim())
          }
          className="w-full h-10 text-sm font-semibold bg-blue-500 hover:bg-blue-600 text-white rounded-md"
        >
          {createGameMutation.isPending ? (
            <>
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Zap className="mr-1.5 h-3.5 w-3.5" />
              Create Game
            </>
          )}
        </Button>

        {createGameMutation.isError && (
          <Alert variant="destructive" className="bg-red-50 border-red-200">
            <AlertDescription className="text-red-800 text-xs">
              {createGameMutation.error?.message || 'Failed to create game'}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
