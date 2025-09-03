import { X, Check } from 'lucide-react';

export function JoinRequestModal({
  joinRequest,
  onAccept,
  onReject,
  acceptMutation,
  rejectMutation,
}: any) {
  if (!joinRequest) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white p-4 rounded-lg shadow-lg w-72 mx-4">
        <h3 className="font-semibold text-gray-900 mb-2 text-sm">
          Join Request
        </h3>
        <p className="text-xs text-gray-600 mb-3">
          Player {joinRequest.requesterId.slice(0, 8)}... wants to join your
          game
          {joinRequest.requesterName && (
            <span className="block text-xs text-gray-500 mt-1">
              ({joinRequest.requesterName})
            </span>
          )}
        </p>
        <div className="flex justify-end gap-2">
          <button
            onClick={onReject}
            disabled={rejectMutation.isPending}
            className="px-2 py-1 text-xs rounded bg-gray-500 text-white hover:bg-gray-600 disabled:opacity-50 transition-colors flex items-center gap-1"
          >
            <X className="w-3 h-3" />
            {rejectMutation.isPending ? 'Rejecting...' : 'Reject'}
          </button>
          <button
            onClick={onAccept}
            disabled={acceptMutation.isPending}
            className="px-2 py-1 text-xs rounded bg-green-500 text-white hover:bg-green-600 disabled:opacity-50 transition-colors flex items-center gap-1"
          >
            <Check className="w-3 h-3" />
            {acceptMutation.isPending ? 'Accepting...' : 'Accept'}
          </button>
        </div>
      </div>
    </div>
  );
}
