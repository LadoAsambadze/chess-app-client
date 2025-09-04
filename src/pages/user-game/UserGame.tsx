import { useState, useEffect, useCallback } from 'react';
import { Chess } from 'chess.js';
import { io, Socket } from 'socket.io-client';
import type { Square } from 'chess.js';

// Unicode chess pieces
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

let socket: Socket;

export function UserGame({
  gameId,
  currentUserId,
}: {
  gameId: string;
  currentUserId: string;
}) {
  const [chess] = useState(new Chess());
  const [board, setBoard] = useState(chess.board());
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [possibleMoves, setPossibleMoves] = useState<string[]>([]);

  // -----------------------
  // Socket setup
  // -----------------------
  useEffect(() => {
    socket = io('http://localhost:4000/games', {
      auth: { userId: currentUserId },
    });

    socket.on('connect', () => {
      console.log('Connected to socket:', socket.id);
      socket.emit('join-game-room', { gameId });
    });

    socket.on('game:joined', (data) => {
      chess.load(data.fen);
      setBoard(chess.board());
    });

    socket.on('chess:move-made', (data) => {
      chess.load(data.fen);
      setBoard(chess.board());
      setSelectedSquare(null);
      setPossibleMoves([]);
    });

    return () => {
      socket.disconnect();
    };
  }, [gameId, currentUserId, chess]);

  // -----------------------
  // Handle square clicks
  // -----------------------
  const handleSquareClick = (square: string) => {
    if (selectedSquare === square) {
      setSelectedSquare(null);
      setPossibleMoves([]);
      return;
    }

    if (selectedSquare) {
      const move = chess.move({
        from: selectedSquare,
        to: square,
        promotion: 'q',
      });
      if (move) {
        setBoard(chess.board());
        setSelectedSquare(null);
        setPossibleMoves([]);

        // Send move via socket
        socket.emit('chess:move', {
          gameId,
          from: move.from,
          to: move.to,
          promotion: move.promotion,
        });
      } else {
        const piece = chess.get(square as Square);
        if (piece && piece.color === chess.turn()) {
          setSelectedSquare(square);
          setPossibleMoves(
            chess.moves({ square: square as Square, verbose: false })
          );
        } else {
          setSelectedSquare(null);
          setPossibleMoves([]);
        }
      }
    } else {
      const piece = chess.get(square as Square);
      if (piece && piece.color === chess.turn()) {
        setSelectedSquare(square);
        setPossibleMoves(
          chess.moves({ square: square as Square, verbose: false })
        );
      }
    }
  };

  // -----------------------
  // Helpers
  // -----------------------
  const getSquareColor = (file: number, rank: number) =>
    (file + rank) % 2 === 0 ? 'bg-amber-100' : 'bg-amber-800';

  const isSquareHighlighted = (square: string) => {
    if (selectedSquare === square) return 'ring-4 ring-blue-400';
    if (possibleMoves.includes(square)) return 'ring-2 ring-green-400';
    return '';
  };

  const getSquareNotation = (file: number, rank: number) => {
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];
    return files[file] + ranks[rank];
  };

  // -----------------------
  // Render board
  // -----------------------
  const renderBoard = () => {
    const squares = [];
    for (let rank = 0; rank < 8; rank++) {
      for (let file = 0; file < 8; file++) {
        const square = getSquareNotation(file, rank);
        const piece = board[rank][file];

        squares.push(
          <div
            key={square}
            className={`w-16 h-16 flex items-center justify-center text-4xl cursor-pointer
              ${getSquareColor(file, rank)} ${isSquareHighlighted(square)}
              hover:brightness-110 transition-all`}
            onClick={() => handleSquareClick(square)}
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
    <div className="flex justify-center items-center min-h-screen bg-slate-900">
      <div className="grid grid-cols-8 border-4 border-slate-600 shadow-2xl">
        {renderBoard()}
      </div>
    </div>
  );
}
