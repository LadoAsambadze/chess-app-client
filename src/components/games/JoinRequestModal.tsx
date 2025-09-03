import { useState, useEffect } from 'react';
import { Clock, User, GamepadIcon } from 'lucide-react';

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
  const isUrgent = timeLeft <= 10;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        {/* Modal */}
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm mx-auto animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="p-6 pb-4">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <GamepadIcon className="w-8 h-8 text-blue-600" />
              </div>
            </div>

            <h2 className="text-xl font-semibold text-gray-900 text-center mb-2">
              Game Request
            </h2>

            <div className="flex items-center justify-center gap-2 text-gray-600 mb-4">
              <User className="w-4 h-4" />
              <span className="text-sm">
                {joinRequest.requesterName || 'Anonymous Player'}
              </span>
            </div>

            <p className="text-gray-700 text-center text-sm">
              wants to join your game
            </p>
          </div>

          {/* Timer */}
          <div className="px-6 pb-4">
            <div className="flex items-center gap-3">
              <Clock
                className={`w-4 h-4 ${
                  isUrgent ? 'text-red-500' : 'text-blue-500'
                }`}
              />
              <div className="flex-1">
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-2 transition-all duration-1000 ease-linear ${
                      isUrgent ? 'bg-red-500' : 'bg-blue-500'
                    }`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
              <span
                className={`text-sm font-mono min-w-[2.5rem] text-right ${
                  isUrgent ? 'text-red-600 font-semibold' : 'text-gray-600'
                }`}
              >
                {timeLeft}s
              </span>
            </div>

            {isUrgent && (
              <p className="text-xs text-red-600 text-center mt-2 animate-pulse">
                Request expires soon!
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 p-6 pt-0">
            <button
              onClick={onReject}
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Decline
            </button>

            <button
              onClick={onAccept}
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                'Accept'
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
