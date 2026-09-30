import { Chess } from 'chess.js';
import type { Board, GameState, MoveRecord, PieceType } from '../types/chess';

export function createInitialBoard(): Board {
  const chess = new Chess();
  return chessBoardToMatrix(chess);
}

export function chessBoardToMatrix(chess: Chess): Board {
  const b = chess.board();
  return b.map((row) =>
    row.map((cell) => {
      if (!cell) return '.';
      return (cell.color === 'w' ? cell.type.toUpperCase() : cell.type.toLowerCase()) as PieceType;
    })
  );
}

export function coordsToSquare(row: number, col: number): string {
  const file = String.fromCharCode(97 + col);
  const rank = 8 - row;
  return `${file}${rank}`;
}

export function squareToCoords(square: string): [number, number] {
  const col = square.charCodeAt(0) - 97;
  const row = 8 - parseInt(square[1], 10);
  return [row, col];
}

export function isWhitePiece(p: PieceType): boolean {
  return p >= 'A' && p <= 'Z' && p !== '.';
}

export function isBlackPiece(p: PieceType): boolean {
  return p >= 'a' && p <= 'z' && p !== '.';
}

/**
 * Reconstruct a Chess instance from GameState
 */
export function getChessInstance(state: GameState): Chess {
  if (state.moveHistory && state.moveHistory.length > 0) {
    const chess = new Chess();
    for (const m of state.moveHistory) {
      const fromSq = coordsToSquare(m.from[0], m.from[1]);
      const toSq = coordsToSquare(m.to[0], m.to[1]);
      try {
        chess.move({
          from: fromSq,
          to: toSq,
          promotion: m.promotion ? m.promotion.toLowerCase() : 'q',
        });
      } catch {
        // Fallback if illegal in sequence
      }
    }
    return chess;
  }

  return new Chess();
}

export function createInitialGame(
  id = 0,
  white = 'g1g7dna0gp4nec5rza4q25htj0cjgswrxefp37ep',
  black = 'g1kewrchessplayerblack777777777777777'
): GameState {
  const chess = new Chess();

  return {
    id,
    white,
    black,
    board: chessBoardToMatrix(chess),
    isWhiteTurn: true,
    status: 'PLAYING',
    whiteKingMoved: false,
    whiteLeftRookMoved: false,
    whiteRightRookMoved: false,
    blackKingMoved: false,
    blackLeftRookMoved: false,
    blackRightRookMoved: false,
    enPassantCol: -1,
    drawOfferedBy: '',
    resignedBy: '',
    moveHistory: [],
  };
}

export function isKingInCheck(state: GameState, isWhite: boolean): boolean {
  const chess = getChessInstance(state);
  const turn = chess.turn();
  const currentIsWhite = turn === 'w';

  if (currentIsWhite === isWhite) {
    return chess.inCheck();
  }

  return false;
}

export function getLegalMovesForPiece(
  state: GameState,
  fromRow: number,
  fromCol: number
): [number, number][] {
  const chess = getChessInstance(state);
  const fromSquare = coordsToSquare(fromRow, fromCol);

  try {
    const legalMoves = chess.moves({ square: fromSquare as any, verbose: true });
    return legalMoves.map((m: any) => squareToCoords(m.to));
  } catch {
    return [];
  }
}

export function executeMove(
  state: GameState,
  fromRow: number,
  fromCol: number,
  toRow: number,
  toCol: number,
  promotion?: string
): {
  success: boolean;
  nextState: GameState;
  newState: GameState;
  error: string | null;
  captured?: PieceType;
  isCheckmate: boolean;
  isCheck: boolean;
} {
  const chess = getChessInstance(state);
  const fromSquare = coordsToSquare(fromRow, fromCol);
  const toSquare = coordsToSquare(toRow, toCol);

  try {
    const moveRes = chess.move({
      from: fromSquare,
      to: toSquare,
      promotion: promotion ? promotion.toLowerCase() : 'q',
    });

    if (!moveRes) {
      return {
        success: false,
        nextState: state,
        newState: state,
        error: 'Langkah tidak sah',
        isCheckmate: false,
        isCheck: false,
      };
    }

    const capturedPiece = moveRes.captured
      ? ((moveRes.color === 'w' ? moveRes.captured.toLowerCase() : moveRes.captured.toUpperCase()) as PieceType)
      : undefined;

    const movingPiece = (moveRes.color === 'w'
      ? moveRes.piece.toUpperCase()
      : moveRes.piece.toLowerCase()) as PieceType;

    const newRecord: MoveRecord = {
      from: [fromRow, fromCol],
      to: [toRow, toCol],
      piece: movingPiece,
      captured: capturedPiece,
      promotion: moveRes.promotion ? moveRes.promotion.toUpperCase() : undefined,
      notation: `${fromSquare}-${toSquare}`,
      san: moveRes.san,
    };

    let status = state.status;
    if (chess.isCheckmate()) {
      status = moveRes.color === 'w' ? 'WHITE_WON' : 'BLACK_WON';
    } else if (chess.isDraw() || chess.isStalemate() || chess.isThreefoldRepetition() || chess.isInsufficientMaterial()) {
      status = 'DRAW';
    }

    const nextState: GameState = {
      ...state,
      board: chessBoardToMatrix(chess),
      isWhiteTurn: chess.turn() === 'w',
      status,
      moveHistory: [...state.moveHistory, newRecord],
    };

    return {
      success: true,
      nextState,
      newState: nextState,
      error: null,
      captured: capturedPiece,
      isCheckmate: chess.isCheckmate(),
      isCheck: chess.inCheck(),
    };
  } catch (err: any) {
    return {
      success: false,
      nextState: state,
      newState: state,
      error: err?.message || 'Langkah tidak valid',
      isCheckmate: false,
      isCheck: false,
    };
  }
}

/**
 * Serializes move history array into UCI format space-delimited string (e.g. "e2e4 e7e5 d1h5")
 */
export function moveHistoryToUCI(history: MoveRecord[]): string {
  if (!history || history.length === 0) return '';
  return history
    .map((m) => {
      const fromSq = coordsToSquare(m.from[0], m.from[1]);
      const toSq = coordsToSquare(m.to[0], m.to[1]);
      const promo = m.promotion ? m.promotion.toLowerCase() : '';
      return `${fromSq}${toSq}${promo}`;
    })
    .join(' ');
}

