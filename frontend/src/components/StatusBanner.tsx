import React from 'react';
import type { GameState } from '../types/chess';
import { Trophy, Handshake, AlertTriangle, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { isKingInCheck } from '../utils/chessEngine';

interface StatusBannerProps {
  state: GameState;
  connectedAddress?: string;
  onAcceptDraw: () => void;
  onDeclineDraw: () => void;
  onSettleOnChain?: () => void;
  onConfirmSettlement?: () => void;
  onDisputeSettlement?: () => void;
  onClaimTimeout?: () => void;
  isSettling?: boolean;
  isSettled?: boolean;
}

export const StatusBanner: React.FC<StatusBannerProps> = ({
  state,
  connectedAddress = '',
  onAcceptDraw,
  onDeclineDraw,
  onSettleOnChain,
  onConfirmSettlement,
  onDisputeSettlement,
  onClaimTimeout,
  isSettling = false,
  isSettled = false,
}) => {
  const isWhiteCheck = isKingInCheck(state, true);
  const isBlackCheck = isKingInCheck(state, false);

  // Status PROPOSED: Anti-Fabrication Two-Phase Settlement
  if (state.status === 'PROPOSED') {
    const isProposer = connectedAddress && connectedAddress.toLowerCase() === (state.proposedBy || '').toLowerCase();
    const proposerLabel = state.proposedBy === state.white ? 'Putih' : 'Hitam';

    return (
      <div className="status-banner banner-draw-offer" style={{ borderColor: '#3b82f6', background: 'rgba(59, 130, 246, 0.12)' }}>
        <div className="banner-content">
          <ShieldCheck size={22} className="banner-icon" color="#60a5fa" />
          <div>
            <strong>Proposal Penyelesaian On-Chain!</strong> Diajukan oleh Pemain {proposerLabel}.
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '2px' }}>
              {isProposer
                ? 'Proposal Anda telah tercatat. Menunggu konfirmasi lawan atau finalisasi otomatis.'
                : 'Lawan mengajukan klaim kemenangan. Jika klaim palsu/fiktif, Anda dapat menyanggahnya.'}
            </div>
          </div>
        </div>
        <div className="banner-actions">
          {!isProposer && onConfirmSettlement && (
            <button className="btn-sm btn-accept" onClick={onConfirmSettlement} disabled={isSettling}>
              Konfirmasi (Setuju)
            </button>
          )}
          {!isProposer && onDisputeSettlement && (
            <button className="btn-sm btn-decline" onClick={onDisputeSettlement} disabled={isSettling} style={{ background: '#ef4444' }}>
              Sanggah (Dispute)
            </button>
          )}
        </div>
      </div>
    );
  }

  if (state.status === 'PLAYING') {
    // AFK Turn Timeout banner
    if (state.turnDeadline && state.turnDeadline > 0) {
      const isChallenger = connectedAddress && connectedAddress.toLowerCase() === (state.turnChallengedBy || '').toLowerCase();
      return (
        <div className="status-banner banner-check" style={{ borderColor: '#f59e0b', background: 'rgba(245, 158, 11, 0.12)' }}>
          <AlertTriangle size={20} className="banner-icon" color="#fbbf24" />
          <div style={{ flex: 1 }}>
            <strong>Timer Giliran Lawan Aktif!</strong> Batas waktu respon langkah sedang berjalan on-chain.
          </div>
          {isChallenger && onClaimTimeout && (
            <button
              className="btn-sm"
              onClick={onClaimTimeout}
              disabled={isSettling}
              style={{ background: '#d97706', color: '#fff', fontWeight: 700 }}
            >
              Klaim Menang Timeout
            </button>
          )}
        </div>
      );
    }

    if (state.drawOfferedBy) {
      const offeredColor = state.drawOfferedBy === state.white ? 'Putih (White)' : 'Hitam (Black)';
      return (
        <div className="status-banner banner-draw-offer">
          <div className="banner-content">
            <Handshake size={20} className="banner-icon" />
            <div>
              <strong>Tawaran Remis!</strong> Pemain {offeredColor} mengajukan tawaran remis.
            </div>
          </div>
          <div className="banner-actions">
            <button className="btn-sm btn-accept" onClick={onAcceptDraw}>
              Terima Remis
            </button>
            <button className="btn-sm btn-decline" onClick={onDeclineDraw}>
              Tolak
            </button>
          </div>
        </div>
      );
    }

    if (isWhiteCheck || isBlackCheck) {
      const checkedColor = isWhiteCheck ? 'Putih' : 'Hitam';
      return (
        <div className="status-banner banner-check">
          <AlertTriangle size={20} className="banner-icon" />
          <span>
            <strong>SKAK!</strong> Raja pemain {checkedColor} sedang terancam!
          </span>
        </div>
      );
    }

    return null;
  }

  // Game is finished
  let title = '';
  let subtitle = '';
  let icon = <Trophy size={24} color="currentColor" />;

  if (state.status === 'WHITE_WON') {
    title = 'Putih Menang! 🏆';
    subtitle = state.resignedBy ? 'Pemain Hitam menyerah (Resigned).' : 'Skakmat! Raja Hitam terkunci.';
  } else if (state.status === 'BLACK_WON') {
    title = 'Hitam Menang! 🏆';
    subtitle = state.resignedBy ? 'Pemain Putih menyerah (Resigned).' : 'Skakmat! Raja Putih terkunci.';
  } else if (state.status === 'DRAW') {
    title = 'Permainan Remis (Draw) 🤝';
    subtitle = 'Hasil imbang disepakati atau terjadi kebuntuan (Stalemate).';
    icon = <Handshake size={24} color="currentColor" />;
  }

  return (
    <div className={`status-banner banner-game-over ${state.status.toLowerCase()}`}>
      <div className="banner-content" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className="trophy-wrap">{icon}</div>
          <div>
            <h3 className="game-over-title">{title}</h3>
            <p className="game-over-subtitle">{subtitle}</p>
          </div>
        </div>

        {/* On-Chain Settlement Action (1 TX Final Settlement) */}
        <div>
          {isSettled ? (
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.45rem 0.85rem',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '8px',
              color: '#34d399',
              fontSize: '0.82rem',
              fontWeight: 600,
            }}>
              <CheckCircle2 size={16} />
              <span>Tercatat On-Chain (Settled)</span>
            </div>
          ) : onSettleOnChain ? (
            <button
              className="gno-btn-action gno-btn-primary"
              onClick={onSettleOnChain}
              disabled={isSettling}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.55rem 1.1rem',
                fontSize: '0.85rem',
                fontWeight: 700,
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.25)',
              }}
              title="Catat hasil resmi ke smart contract Gno.land"
            >
              <ShieldCheck size={16} />
              <span>{isSettling ? 'Menyimpan On-Chain...' : 'Settle On-Chain (1 TX)'}</span>
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
};
