import React from 'react';
import type { GameState } from '../types/chess';
import { ChessPiece } from './ChessPiece';
import { getLegalMovesForPiece, isWhitePiece, isKingInCheck } from '../utils/chessEngine';

interface ChessboardProps {
  state: GameState;
  selectedSquare: [number, number] | null;
  onSelectSquare: (pos: [number, number] | null) => void;
  onMoveTo: (toRow: number, toCol: number) => void;
  flipped: boolean;
}

export const Chessboard: React.FC<ChessboardProps> = ({
  state,
  selectedSquare,
  onSelectSquare,
  onMoveTo,
  flipped,
}) => {
  const legalMoves = selectedSquare
    ? getLegalMovesForPiece(state, selectedSquare[0], selectedSquare[1])
    : [];

  const isSelected = (r: number, c: number) =>
    selectedSquare && selectedSquare[0] === r && selectedSquare[1] === c;

  const isLegalTarget = (r: number, c: number) =>
    legalMoves.some(([mr, mc]) => mr === r && mc === c);

  const lastMove = state.moveHistory[state.moveHistory.length - 1];
  const isLastMoveSquare = (r: number, c: number) => {
    if (!lastMove) return false;
    return (
      (lastMove.from[0] === r && lastMove.from[1] === c) ||
      (lastMove.to[0] === r && lastMove.to[1] === c)
    );
  };

  const isWhiteCheck = isKingInCheck(state, true);
  const isBlackCheck = isKingInCheck(state, false);

  const handleSquareClick = (r: number, c: number) => {
    if (state.status !== 'PLAYING') return;

    const piece = state.board[r][c];
    const isOwnPiece =
      piece !== '.' && isWhitePiece(piece) === state.isWhiteTurn;

    if (selectedSquare) {
      if (isLegalTarget(r, c)) {
        onMoveTo(r, c);
        return;
      }
      if (isOwnPiece) {
        onSelectSquare([r, c]);
        return;
      }
      onSelectSquare(null);
    } else {
      if (isOwnPiece) {
        onSelectSquare([r, c]);
      }
    }
  };

  // Build row and col arrays based on flip perspective
  const rowIndices = flipped ? [7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7];
  const colIndices = flipped ? [7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7];
  const colLetters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

  return (
    <div className="gno-board-perspective-wrapper">
      <div className="gno-board-container">
        {/* 8x8 Grid of Gno Chicklet Tiles */}
        <div className="gno-chicklet-grid">
          {rowIndices.map((r, rIdx) =>
            colIndices.map((c, cIdx) => {
              const piece = state.board[r][c];
              const isDark = (r + c) % 2 !== 0;
              const selected = isSelected(r, c);
              const legalTarget = isLegalTarget(r, c);
              const isCapture = legalTarget && piece !== '.';
              const lastMoveHighlight = isLastMoveSquare(r, c);

              const isKingChecked =
                (piece === 'K' && isWhiteCheck) ||
                (piece === 'k' && isBlackCheck);

              return (
                <div
                  key={`sq-${r}-${c}`}
                  className={`gno-tile ${isDark ? 'gno-tile-dark' : 'gno-tile-light'} ${
                    selected ? 'gno-tile-selected' : ''
                  } ${lastMoveHighlight && !selected ? 'gno-tile-lastmove' : ''} ${
                    isKingChecked ? 'gno-tile-check' : ''
                  }`}
                  onClick={() => handleSquareClick(r, c)}
                >
                  {/* Rank notation on leftmost column */}
                  {cIdx === 0 && (
                    <span className="gno-coord-rank">{8 - r}</span>
                  )}

                  {/* File notation on bottommost row */}
                  {rIdx === 7 && (
                    <span className="gno-coord-file">{colLetters[c]}</span>
                  )}

                  {/* Legal move circle indicator */}
                  {legalTarget && !isCapture && <div className="gno-move-dot" />}
                  {isCapture && <div className="gno-capture-ring" />}

                  {/* 3D Staunton Piece */}
                  <ChessPiece piece={piece} isBoardPiece={true} />
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default Chessboard;
