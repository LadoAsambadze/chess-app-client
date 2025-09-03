import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';

interface JoinRequestModalProps {
  joinRequest: {
    gameId: string;
    requesterId: string;
    requesterName?: string;
    timestamp?: number;
  } | null;
  onAccept: () => void;
  onReject: () => void;
  acceptMutation: { isPending: boolean };
  rejectMutation: { isPending: boolean };
}

const TIMEOUT_DURATION = 30; // seconds

export function JoinRequestModal({
  joinRequest,
  onAccept,
  onReject,
  acceptMutation,
  rejectMutation,
}: JoinRequestModalProps) {
  const [timeLeft, setTimeLeft] = useState(TIMEOUT_DURATION);

  useEffect(() => {
    if (!joinRequest) return;

    const now = Date.now();
    const requestTime = joinRequest.timestamp || now;
    const elapsed = Math.floor((now - requestTime) / 1000);
    const initialRemaining = Math.max(0, TIMEOUT_DURATION - elapsed);

    setTimeLeft(initialRemaining);

    if (initialRemaining === 0) {
      onReject();
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onReject();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [joinRequest, onReject]);

  if (!joinRequest) return null;

  const isLoading = acceptMutation.isPending || rejectMutation.isPending;
  const progressPercent = (timeLeft / TIMEOUT_DURATION) * 100;

  return (
    <AlertDialog open={!!joinRequest}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Join Request
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              {joinRequest.requesterName || 'A player'} wants to join your game.
            </p>
            {timeLeft > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-blue-600 h-2 transition-[width] duration-1000 ease-linear"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <span className="text-xs font-mono min-w-[3ch]">
                  {timeLeft}s
                </span>
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            onClick={onReject}
            disabled={isLoading}
            className="text-xs"
          >
            Reject
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onAccept}
            disabled={isLoading}
            className="text-xs"
          >
            {isLoading ? 'Processing…' : 'Accept'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
