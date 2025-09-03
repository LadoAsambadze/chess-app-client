'use client';

import { useState, useEffect } from 'react';
import { Clock, User, X } from 'lucide-react';

interface JoinRequestModalProps {
  joinRequest: {
    gameId: string;
    requesterId: string;
    requesterName?: string;
  } | null;
  onAccept: () => void;
  onReject: () => void;
  acceptMutation: any;
  rejectMutation: any;
}

export function JoinRequestModal({
  joinRequest,
  onAccept,
  onReject,
  acceptMutation,
  rejectMutation,
}: JoinRequestModalProps) {
  const [timeLeft, setTimeLeft] = useState(30);

  useEffect(() => {
    if (!joinRequest) {
      setTimeLeft(30);
      return;
    }

    // Start countdown timer
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Auto-reject when timer reaches 0
          onReject();
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [joinRequest, onReject]);

  if (!joinRequest) return null;

  const isLoading = acceptMutation.isPending || rejectMutation.isPending;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Join Request</h3>
          <button
            onClick={onReject}
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {joinRequest.requesterName || 'Player'}
              </p>
              <p className="text-xs text-gray-500">wants to join your game</p>
            </div>
          </div>

          {/* Timer Display */}
          <div className="flex items-center gap-2 p-3 bg-orange-50 rounded-lg border border-orange-200">
            <Clock className="w-4 h-4 text-orange-600" />
            <span className="text-sm text-orange-700">
              Auto-reject in {timeLeft} seconds
            </span>
            <div className="ml-auto">
              <div className="w-16 h-2 bg-orange-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-orange-500 transition-all duration-1000 ease-linear"
                  style={{ width: `${(timeLeft / 30) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onReject}
            disabled={isLoading}
            className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {rejectMutation.isPending ? 'Rejecting...' : 'Reject'}
          </button>
          <button
            onClick={onAccept}
            disabled={isLoading}
            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {acceptMutation.isPending ? 'Accepting...' : 'Accept'}
          </button>
        </div>
      </div>
    </div>
  );
}
