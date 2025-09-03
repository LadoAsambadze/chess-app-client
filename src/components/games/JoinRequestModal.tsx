import { useEffect, useState } from 'react';
import { X, Clock, User } from 'lucide-react';

interface JoinRequestModalProps {
  joinRequest: {
    gameId: string;
    requesterId: string;
    requesterName?: string;
    timestamp?: number;
  } | null;
  onAccept: () => Promise<void>;
  onReject: () => Promise<void>;
  onForceClose?: () => void;
  acceptMutation: any;
  rejectMutation: any;
}

export function JoinRequestModal({
  joinRequest,
  onAccept,
  onReject,
  onForceClose,
  acceptMutation,
  rejectMutation,
}: JoinRequestModalProps) {
  const [timeLeft, setTimeLeft] = useState(30);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!joinRequest) {
      setTimeLeft(30);
      setIsProcessing(false);
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Auto-close modal when timer reaches 0
          if (onForceClose) {
            onForceClose();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [joinRequest, onForceClose]);

  const handleAccept = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      await onAccept();
    } catch (error) {
      console.error('Error accepting request:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      await onReject();
    } catch (error) {
      console.error('Error rejecting request:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleForceClose = () => {
    if (isProcessing) return;
    if (onForceClose) {
      onForceClose();
    }
  };

  if (!joinRequest) return null;

  const isLoading =
    acceptMutation.isPending || rejectMutation.isPending || isProcessing;
  const gameIdShort = joinRequest.gameId.slice(0, 8);
  const requesterIdShort = joinRequest.requesterId.slice(0, 8);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-semibold text-gray-900">
              Join Request
            </h3>
          </div>
          <button
            onClick={handleForceClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-gray-700 mb-2">
            Player{' '}
            <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
              {joinRequest.requesterName || requesterIdShort}...
            </span>{' '}
            wants to join your game
          </p>

          <p className="text-sm text-gray-500 mb-4">
            Game ID:{' '}
            <span className="font-mono bg-gray-100 px-2 py-1 rounded">
              {gameIdShort}...
            </span>
          </p>

          {/* Countdown Timer */}
          <div className="flex items-center gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <Clock className="w-4 h-4 text-orange-500" />
            <span className="text-sm text-orange-700">
              Auto-reject in {timeLeft} seconds
            </span>
            <div className="ml-auto">
              <div className="w-16 bg-orange-200 rounded-full h-2">
                <div
                  className="bg-orange-500 h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${(timeLeft / 30) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Error Messages */}
        {acceptMutation.error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">
              Error accepting request:{' '}
              {acceptMutation.error?.message || 'Unknown error'}
            </p>
          </div>
        )}

        {rejectMutation.error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">
              Error rejecting request:{' '}
              {rejectMutation.error?.message || 'Unknown error'}
            </p>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={handleReject}
            disabled={isLoading || timeLeft <= 0}
            className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {rejectMutation.isPending ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                Rejecting...
              </span>
            ) : (
              'Reject'
            )}
          </button>

          <button
            onClick={handleAccept}
            disabled={isLoading || timeLeft <= 0}
            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {acceptMutation.isPending ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Accepting...
              </span>
            ) : (
              'Accept & Start Game'
            )}
          </button>
        </div>

        {timeLeft <= 0 && (
          <p className="text-center text-sm text-red-600 mt-3">
            Request timed out. The modal will close automatically.
          </p>
        )}
      </div>
    </div>
  );
}
