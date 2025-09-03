import { useState, useEffect, useCallback } from 'react';
import { Chess } from 'chess.js';
import {
  Clock,
  User,
  Crown,
  Flag,
  RotateCcw,
  MessageSquare,
  Volume2,
  VolumeX,
  SkipForward,
} from 'lucide-react';

// Chess piece Unicode symbols
const PIECE_SYMBOLS = {
  K: '♔',
  Q: '♕',
  R: '♖',
  B: '♗',
  N: '♘',
  P: '♙', // White pieces
  k: '♚',
  q: '♛',
  r: '♜',
  b: '♝',
  n: '♞',
  p: '♟', // Black pieces
};

interface GameState {
  whiteTime: number;
  blackTime: number;
  isTimerRunning: boolean;
}

export function UserGame() {
  const [chess] = useState(new Chess());
  const [board, setBoard] = useState(chess.board());
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [possibleMoves, setPossibleMoves] = useState<string[]>([]);
  const [playerColor, setPlayerColor] = useState<'white' | 'black'>('white');
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [gameState, setGameState] = useState<GameState>({
    whiteTime: 600, // 10 minutes
    blackTime: 600,
    isTimerRunning: true,
  });
  const [moveHistory, setMoveHistory] = useState<string[]>([]);

  // Timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (gameState.isTimerRunning && !chess.isGameOver()) {
      timer = setInterval(() => {
        setGameState((prev) => {
          const isWhiteTurn = chess.turn() === 'w';
          return {
            ...prev,
            whiteTime: isWhiteTurn
              ? Math.max(0, prev.whiteTime - 1)
              : prev.whiteTime,
            blackTime: !isWhiteTurn
              ? Math.max(0, prev.blackTime - 1)
              : prev.blackTime,
          };
        });
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [gameState.isTimerRunning, chess]);

  const updateBoard = useCallback(() => {
    setBoard(chess.board());
    setMoveHistory(chess.history());
  }, [chess]);

  const handleSquareClick = (square: string) => {
    if (selectedSquare === square) {
      // Deselect if clicking the same square
      setSelectedSquare(null);
      setPossibleMoves([]);
      return;
    }

    if (selectedSquare) {
      // Try to make a move
      try {
        const move = chess.move({
          from: selectedSquare,
          to: square,
          promotion: 'q', // Always promote to queen for now
        });

        if (move) {
          updateBoard();
          setSelectedSquare(null);
          setPossibleMoves([]);

          // Play sound effect (placeholder)
          if (isSoundEnabled) {
            // In a real app, you'd play actual sound files here
            console.log('Move sound:', move.san);
          }
        } else {
          // Invalid move, try selecting the new square
          const piece = chess.get(square);
          if (piece && piece.color === chess.turn()) {
            setSelectedSquare(square);
            setPossibleMoves(chess.moves({ square, verbose: false }));
          } else {
            setSelectedSquare(null);
            setPossibleMoves([]);
          }
        }
      } catch (error) {
        // Invalid move, clear selection
        setSelectedSquare(null);
        setPossibleMoves([]);
      }
    } else {
      // Select a square
      const piece = chess.get(square);
      if (piece && piece.color === chess.turn()) {
        setSelectedSquare(square);
        const moves = chess.moves({ square, verbose: false });
        setPossibleMoves(moves);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getSquareColor = (file: number, rank: number) => {
    return (file + rank) % 2 === 0 ? 'bg-amber-100' : 'bg-amber-800';
  };

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

  const renderBoard = () => {
    const squares = [];
    const boardToRender =
      playerColor === 'white' ? board : [...board].reverse();

    for (let rank = 0; rank < 8; rank++) {
      for (let file = 0; file < 8; file++) {
        const actualRank = playerColor === 'white' ? rank : 7 - rank;
        const actualFile = playerColor === 'white' ? file : 7 - file;
        const square = getSquareNotation(actualFile, actualRank);
        const piece = boardToRender[rank][file];

        squares.push(
          <div
            key={square}
            className={`
              w-16 h-16 flex items-center justify-center cursor-pointer text-4xl
              ${getSquareColor(file, rank)}
              ${isSquareHighlighted(square)}
              hover:brightness-110 transition-all
            `}
            onClick={() => handleSquareClick(square)}
          >
            {piece &&
              PIECE_SYMBOLS[
                piece.type === piece.type.toUpperCase()
                  ? piece.type
                  : piece.type.toLowerCase()
              ]}
          </div>
        );
      }
    }

    return squares;
  };

  const handleResign = () => {
    if (window.confirm('Are you sure you want to resign?')) {
      setGameState((prev) => ({ ...prev, isTimerRunning: false }));
      // In real implementation, send resignation to server
      console.log('Player resigned');
    }
  };

  const handleOfferDraw = () => {
    // In real implementation, send draw offer to opponent
    console.log('Draw offered');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Game Info */}
          <div className="lg:col-span-1 space-y-4">
            {/* Opponent Info */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-slate-600 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold">Opponent</h3>
                  <div className="text-sm text-slate-400">Rating: 1542</div>
                </div>
                {playerColor === 'black' && (
                  <Crown className="w-5 h-5 text-white ml-auto" />
                )}
                {playerColor === 'white' && (
                  <Crown className="w-5 h-5 text-slate-900 ml-auto" />
                )}
              </div>

              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span
                  className={`font-mono text-lg ${
                    (chess.turn() === 'b' && playerColor === 'white') ||
                    (chess.turn() === 'w' && playerColor === 'black')
                      ? 'text-red-400'
                      : 'text-slate-300'
                  }`}
                >
                  {playerColor === 'white'
                    ? formatTime(gameState.blackTime)
                    : formatTime(gameState.whiteTime)}
                </span>
              </div>
            </div>

            {/* Game Controls */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 space-y-3">
              <button
                onClick={handleResign}
                className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Flag className="w-4 h-4" />
                Resign
              </button>

              <button
                onClick={handleOfferDraw}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Offer Draw
              </button>

              <button
                onClick={() => setIsSoundEnabled(!isSoundEnabled)}
                className="w-full bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {isSoundEnabled ? (
                  <Volume2 className="w-4 h-4" />
                ) : (
                  <VolumeX className="w-4 h-4" />
                )}
                Sound
              </button>

              <button
                onClick={() =>
                  setPlayerColor(playerColor === 'white' ? 'black' : 'white')
                }
                className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <SkipForward className="w-4 h-4" />
                Flip Board
              </button>
            </div>

            {/* Game Status */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
              <h3 className="font-semibold mb-2">Game Status</h3>
              <div className="text-sm space-y-1">
                <div>
                  Turn:{' '}
                  <span className="text-blue-400 capitalize">
                    {chess.turn() === 'w' ? 'White' : 'Black'}
                  </span>
                </div>
                <div>
                  Status:{' '}
                  <span className="text-green-400">
                    {chess.isGameOver()
                      ? chess.isCheckmate()
                        ? 'Checkmate'
                        : chess.isDraw()
                        ? 'Draw'
                        : 'Game Over'
                      : chess.inCheck()
                      ? 'Check'
                      : 'Playing'}
                  </span>
                </div>
                <div>
                  Moves:{' '}
                  <span className="text-slate-400">{moveHistory.length}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Center - Chess Board */}
          <div className="lg:col-span-2 flex flex-col items-center justify-center">
            {/* Board coordinates and board */}
            <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 shadow-2xl">
              {/* Top coordinates */}
              <div className="flex justify-center mb-2">
                {(playerColor === 'white'
                  ? ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
                  : ['h', 'g', 'f', 'e', 'd', 'c', 'b', 'a']
                ).map((file) => (
                  <div
                    key={file}
                    className="w-16 h-6 flex items-center justify-center text-sm text-slate-400"
                  >
                    {file}
                  </div>
                ))}
              </div>

              <div className="flex">
                {/* Left coordinates */}
                <div className="flex flex-col mr-2">
                  {(playerColor === 'white'
                    ? ['8', '7', '6', '5', '4', '3', '2', '1']
                    : ['1', '2', '3', '4', '5', '6', '7', '8']
                  ).map((rank) => (
                    <div
                      key={rank}
                      className="w-6 h-16 flex items-center justify-center text-sm text-slate-400"
                    >
                      {rank}
                    </div>
                  ))}
                </div>

                {/* Chess Board */}
                <div className="grid grid-cols-8 border-2 border-slate-600">
                  {renderBoard()}
                </div>

                {/* Right coordinates */}
                <div className="flex flex-col ml-2">
                  {(playerColor === 'white'
                    ? ['8', '7', '6', '5', '4', '3', '2', '1']
                    : ['1', '2', '3', '4', '5', '6', '7', '8']
                  ).map((rank) => (
                    <div
                      key={rank}
                      className="w-6 h-16 flex items-center justify-center text-sm text-slate-400"
                    >
                      {rank}
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom coordinates */}
              <div className="flex justify-center mt-2">
                {(playerColor === 'white'
                  ? ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
                  : ['h', 'g', 'f', 'e', 'd', 'c', 'b', 'a']
                ).map((file) => (
                  <div
                    key={file}
                    className="w-16 h-6 flex items-center justify-center text-sm text-slate-400"
                  >
                    {file}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar - Player Info & Move History */}
          <div className="lg:col-span-1 space-y-4">
            {/* Player Info */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold">You</h3>
                  <div className="text-sm text-slate-400">Rating: 1423</div>
                </div>
                {playerColor === 'white' && (
                  <Crown className="w-5 h-5 text-white ml-auto" />
                )}
                {playerColor === 'black' && (
                  <Crown className="w-5 h-5 text-slate-900 ml-auto" />
                )}
              </div>

              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span
                  className={`font-mono text-lg ${
                    (chess.turn() === 'w' && playerColor === 'white') ||
                    (chess.turn() === 'b' && playerColor === 'black')
                      ? 'text-red-400'
                      : 'text-slate-300'
                  }`}
                >
                  {playerColor === 'white'
                    ? formatTime(gameState.whiteTime)
                    : formatTime(gameState.blackTime)}
                </span>
              </div>
            </div>

            {/* Move History */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <MessageSquare className="w-4 h-4" />
                <h3 className="font-semibold">Move History</h3>
              </div>

              <div className="max-h-64 overflow-y-auto space-y-1 text-sm">
                {moveHistory.length === 0 ? (
                  <p className="text-slate-400">No moves yet</p>
                ) : (
                  moveHistory.map((move, index) => (
                    <div key={index} className="flex justify-between">
                      <span className="text-slate-400">
                        {Math.floor(index / 2) + 1}.
                      </span>
                      <span className="text-slate-200">{move}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Game Result */}
            {chess.isGameOver() && (
              <div className="bg-green-800/50 border border-green-700 rounded-lg p-4">
                <h3 className="font-semibold mb-2 text-green-300">
                  Game Over!
                </h3>
                <div className="text-sm text-green-200">
                  {chess.isCheckmate()
                    ? `Checkmate! ${
                        chess.turn() === 'w' ? 'Black' : 'White'
                      } wins!`
                    : chess.isDraw()
                    ? 'Game ended in a draw!'
                    : 'Game over!'}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
