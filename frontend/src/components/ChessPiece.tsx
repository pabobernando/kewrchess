import React from 'react';
import type { PieceType } from '../types/chess';

interface ChessPieceProps {
  piece: PieceType;
  size?: number;
  className?: string;
  isBoardPiece?: boolean;
}

const pieceImageMap: Record<string, string> = {
  'K': '/img/images/pieces/merida/wK.svg',
  'Q': '/img/images/pieces/merida/wQ.svg',
  'R': '/img/images/pieces/merida/wR.svg',
  'B': '/img/images/pieces/merida/wB.svg',
  'N': '/img/images/pieces/merida/wN.svg',
  'P': '/img/images/pieces/merida/wP.svg',
  'k': '/img/images/pieces/merida/bK.svg',
  'q': '/img/images/pieces/merida/bQ.svg',
  'r': '/img/images/pieces/merida/bR.svg',
  'b': '/img/images/pieces/merida/bB.svg',
  'n': '/img/images/pieces/merida/bN.svg',
  'p': '/img/images/pieces/merida/bP.svg',
};

const pieceNameMap: Record<string, string> = {
  'K': 'White King',
  'Q': 'White Queen',
  'R': 'White Rook',
  'B': 'White Bishop',
  'N': 'White Knight',
  'P': 'White Pawn',
  'k': 'Black King',
  'q': 'Black Queen',
  'r': 'Black Rook',
  'b': 'Black Bishop',
  'n': 'Black Knight',
  'p': 'Black Pawn',
};

export const ChessPiece: React.FC<ChessPieceProps> = ({
  piece,
  size,
  className = '',
  isBoardPiece = false,
}) => {
  if (piece === '.') return null;

  const imgSrc = pieceImageMap[piece];
  if (!imgSrc) return null;

  if (isBoardPiece) {
    return (
      <img
        src={imgSrc}
        alt={pieceNameMap[piece] || 'Chess Piece'}
        className={`chess-piece-board-img ${className}`}
        draggable={false}
      />
    );
  }

  return (
    <img
      src={imgSrc}
      alt={pieceNameMap[piece] || 'Chess Piece'}
      className={`chess-piece-img ${className}`}
      style={{
        width: size || 40,
        height: size || 40,
        objectFit: 'contain',
        pointerEvents: 'none',
        userSelect: 'none',
      }}
      draggable={false}
    />
  );
};

export default ChessPiece;
