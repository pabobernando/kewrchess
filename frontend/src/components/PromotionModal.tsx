import React from 'react';
import { ChessPiece } from './ChessPiece';
import type { PieceType } from '../types/chess';

interface PromotionModalProps {
  isOpen: boolean;
  isWhite: boolean;
  onSelect: (piece: 'Q' | 'N' | 'R' | 'B') => void;
  onCancel: () => void;
}

export const PromotionModal: React.FC<PromotionModalProps> = ({ isOpen, isWhite, onSelect, onCancel }) => {
  if (!isOpen) return null;

  const choices: { id: 'Q' | 'N' | 'R' | 'B'; label: string; desc: string; piece: PieceType }[] = [
    { id: 'Q', label: 'Ratu / Queen', desc: 'Paling kuat & serbaguna', piece: isWhite ? 'Q' : 'q' },
    { id: 'N', label: 'Kuda / Knight', desc: 'Langkah manuver & garpuan', piece: isWhite ? 'N' : 'n' },
    { id: 'R', label: 'Benteng / Rook', desc: 'Kontrol jalur lurus', piece: isWhite ? 'R' : 'r' },
    { id: 'B', label: 'Gajah / Bishop', desc: 'Penguasa diagonal', piece: isWhite ? 'B' : 'b' },
  ];

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="promotion-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>👑 Promosi Pion</h3>
          <p>Pilih bidak untuk mentransformasikan pion Anda:</p>
        </div>

        <div className="promotion-choices">
          {choices.map((choice) => (
            <button
              key={choice.id}
              className="promotion-card"
              onClick={() => onSelect(choice.id)}
            >
              <div className="promo-piece-wrap">
                <ChessPiece piece={choice.piece} size={56} />
              </div>
              <span className="promo-label">{choice.label}</span>
              <span className="promo-desc">{choice.desc}</span>
            </button>
          ))}
        </div>

        <button className="btn-cancel" onClick={onCancel}>
          Batal Langkah
        </button>
      </div>
    </div>
  );
};
