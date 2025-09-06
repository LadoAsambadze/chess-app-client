import { useState } from 'react';
import { Chess } from 'chess.js';

const PIECE_SYMBOLS = {
  K: '♔',
  Q: '♕',
  R: '♖',
  B: '♗',
  N: '♘',
  P: '♙',
  k: '♚',
  q: '♛',
  r: '♜',
  b: '♝',
  n: '♞',
  p: '♟',
};

export function UserGame() {
  const [chess] = useState(new Chess());
  const [board] = useState(chess.board());

  const getSquareColor = (file: number, rank: number) => {
    const isLight = (file + rank) % 2 === 0;
    return isLight ? 'bg-amber-200' : 'bg-amber-700';
  };

  const renderBoard = () => {
    const squares = [];
    for (let rank = 0; rank < 8; rank++) {
      for (let file = 0; file < 8; file++) {
        const piece = board[rank][file];

        squares.push(
          <div
            key={`${rank}-${file}`}
            className={`w-16 h-16 flex items-center justify-center text-5xl ${getSquareColor(
              file,
              rank
            )}`}
          >
            {piece &&
              PIECE_SYMBOLS[
                (piece.color === 'w'
                  ? piece.type.toUpperCase()
                  : piece.type.toLowerCase()) as keyof typeof PIECE_SYMBOLS
              ]}
          </div>
        );
      }
    }
    return squares;
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-slate-900 p-4">
      <h2 className="text-2xl font-bold text-white mb-6">Chess Game</h2>
      <div className="grid grid-cols-8 border-4 border-slate-600 shadow-2xl">
        {renderBoard()}
      </div>
      <div className="mt-6 flex gap-4">
        <button className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition">
          Resign
        </button>
        <button className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition">
          Offer Draw
        </button>
      </div>
    </div>
  );
}
