export type PieceType = 'P' | 'R' | 'N' | 'B' | 'Q' | 'K' | 'p' | 'r' | 'n' | 'b' | 'q' | 'k' | '.';

export type Board = PieceType[][];

export type GameStatus = 'PLAYING' | 'PROPOSED' | 'WHITE_WON' | 'BLACK_WON' | 'DRAW';

export interface MoveRecord {
  from: [number, number];
  to: [number, number];
  piece: PieceType;
  captured?: PieceType;
  promotion?: string;
  notation: string;
  san: string;
}

export interface GameState {
  id: number;
  white: string;
  black: string;
  board: Board;
  isWhiteTurn: boolean;
  status: GameStatus;
  whiteKingMoved: boolean;
  whiteLeftRookMoved: boolean;
  whiteRightRookMoved: boolean;
  blackKingMoved: boolean;
  blackLeftRookMoved: boolean;
  blackRightRookMoved: boolean;
  enPassantCol: number;
  drawOfferedBy: string;
  resignedBy: string;
  moveHistory: MoveRecord[];

  // Anti-Cheat & Timeout Fields
  proposedBy?: string;
  pendingStatus?: string;
  challengeDeadline?: number;
  turnDeadline?: number;
  turnChallengedBy?: string;
}
