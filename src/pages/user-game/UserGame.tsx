import { useState } from 'react';
import { Chess } from 'chess.js';
import { useNavigate } from 'react-router-dom';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../components/ui/alert-dialog';
import { useGameActions } from '../../hooks/games/useGameActions';

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
  const navigate = useNavigate();

  const {
    resignGame,
    offerDraw,
    respondToDraw,
    loading,
    error,
    drawOfferReceived,
    showDrawOfferModal,
    drawOfferSent,
    gameFinishedData,
    showGameEndModal,
    closeModal,
    closeDrawOfferModal,
  } = useGameActions();

  const handleResign = async () => {
    try {
      await resignGame();
    } catch (err) {
      console.error('Failed to resign:', err);
    }
  };

  const handleOfferDraw = async () => {
    try {
      await offerDraw();
    } catch (err) {
      console.error('Failed to offer draw:', err);
    }
  };

  const handleDrawResponse = async (accept: boolean) => {
    try {
      await respondToDraw(accept);
    } catch (err) {
      console.error('Failed to respond to draw:', err);
    }
  };

  const handleModalClose = () => {
    closeModal();
    closeDrawOfferModal();
    navigate('/games');
  };

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
            )} ${showGameEndModal || showDrawOfferModal ? 'opacity-50' : ''}`}
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

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg max-w-md text-center">
          <p className="font-medium">Error:</p>
          <p>{error}</p>
        </div>
      )}

      {drawOfferSent && !loading && (
        <div className="mb-4 p-3 bg-blue-100 border border-blue-400 text-blue-700 rounded-lg max-w-md text-center">
          <p className="font-medium">Draw offer sent!</p>
          <p>Waiting for your opponent's response...</p>
        </div>
      )}

      <div className="grid grid-cols-8 border-4 border-slate-600 shadow-2xl">
        {renderBoard()}
      </div>

      <div className="mt-6 flex gap-4">
        <button
          onClick={handleResign}
          disabled={loading || showGameEndModal || showDrawOfferModal}
          className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {loading ? 'Resigning...' : 'Resign'}
        </button>
        <button
          onClick={handleOfferDraw}
          disabled={
            loading || showGameEndModal || showDrawOfferModal || drawOfferSent
          }
          className="px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {loading
            ? 'Offering Draw...'
            : drawOfferSent
            ? 'Draw Offered'
            : 'Offer Draw'}
        </button>
      </div>

      {/* Game End AlertDialog */}
      <AlertDialog open={showGameEndModal} onOpenChange={() => {}}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {gameFinishedData?.isDraw ? (
                <span className="text-blue-600">🤝 Draw!</span>
              ) : gameFinishedData?.isWinner ? (
                <span className="text-green-600">🎉 You Won!</span>
              ) : (
                <span className="text-red-600">💔 You Lost</span>
              )}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              {gameFinishedData?.message || 'Game has ended.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={handleModalClose}
              className={`${
                gameFinishedData?.isDraw
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : gameFinishedData?.isWinner
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-blue-600 hover:bg-blue-700'
              } text-white font-medium`}
            >
              {gameFinishedData?.isDraw
                ? 'Good Game! 🤝'
                : gameFinishedData?.isWinner
                ? 'Celebrate! 🎊'
                : 'Back to Games'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Draw Offer AlertDialog */}
      <AlertDialog open={showDrawOfferModal} onOpenChange={closeDrawOfferModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              <span className="text-yellow-600">🤝 Draw Offer</span>
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              {drawOfferReceived?.message ||
                'Your opponent has offered a draw. Do you accept?'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex gap-2">
            <AlertDialogCancel
              onClick={() => handleDrawResponse(false)}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700 text-white font-medium border-red-600"
            >
              {loading ? 'Responding...' : 'Decline'}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleDrawResponse(true)}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 text-white font-medium"
            >
              {loading ? 'Responding...' : 'Accept Draw'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
