import React, { useState } from 'react';
import type { PieceType } from '../types/chess';
import { ChessPiece } from './ChessPiece';
import { Copy, Check } from 'lucide-react';

interface PlayerCardProps {
  color: 'white' | 'black';
  address: string;
  isTurn: boolean;
  isCheck: boolean;
  capturedPieces: PieceType[];
  timeLeftSeconds?: number;
  roleLabel?: string; // 'rival' or 'me'
}

export const PlayerCard: React.FC<PlayerCardProps> = ({
  color,
  address,
  isTurn,
  isCheck,
  capturedPieces,
  timeLeftSeconds = 600,
  roleLabel,
}) => {
  const [copied, setCopied] = useState(false);
  const isWhite = color === 'white';

  const formatAddress = (addr: string) => {
    if (!addr) return 'Waiting for player...';
    if (addr === 'g1kewrchessplayerblack777777777777777') {
      return 'Waiting opponent (Guest)';
    }
    if (addr === 'g1g7dna0gp4nec5rza4q25htj0cjgswrxefp37ep') {
      return 'Host Player';
    }
    if (addr.length <= 16) return addr;
    return `${addr.slice(0, 8)}...${addr.slice(-6)}`;
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`gno-player-panel ${isTurn ? 'gno-turn-active' : ''} ${isCheck ? 'gno-check-active' : ''}`}>
      <div className="gno-player-header-row">
        <div className="gno-avatar-circle">
          <img
            src="/img/mini-gopher.png"
            alt="Player avatar"
            className="gno-avatar-img"
          />
        </div>

        <div className="gno-player-meta">
          <div className="gno-role-line">
            <span className="gno-role-tag">{roleLabel || (isWhite ? 'White' : 'Black')}</span>
            {isTurn && <span className="gno-turn-pill">Active Turn</span>}
            {isCheck && <span className="gno-check-pill">CHECK!</span>}
          </div>

          <div className="gno-player-addr-row">
            <span className="gno-addr-text font-mono" title={address}>
              {formatAddress(address)}
            </span>
            <button className="gno-btn-copy" onClick={handleCopy} title="Copy Address">
              {copied ? <Check size={11} color="currentColor" /> : <Copy size={11} />}
            </button>
          </div>
        </div>
      </div>

      {/* GnoChess Signature Giant Digital Clock */}
      <div className="gno-clock-container">
        <time className={`gno-giant-clock ${isTurn ? 'clock-ticking' : ''}`}>
          {formatTime(timeLeftSeconds)}
        </time>
      </div>

      {/* Captured Pieces List */}
      <div className="gno-captured-strip">
        {capturedPieces.length === 0 ? (
          <span className="empty-captured-placeholder">No captured pieces</span>
        ) : (
          capturedPieces.map((p, idx) => (
            <div key={`cap-${idx}`} className="gno-captured-item">
              <ChessPiece piece={p} size={22} />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PlayerCard;
