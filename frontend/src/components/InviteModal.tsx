import React, { useState } from 'react';
import { Copy, Check, Share2, Sparkles } from 'lucide-react';

interface InviteModalProps {
  isOpen: boolean;
  roomId: string;
  opponentConnected: boolean;
  onClose: () => void;
}

export const InviteModal: React.FC<InviteModalProps> = ({
  isOpen,
  roomId,
  opponentConnected,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';
  const inviteUrl = `${origin}/?room=${roomId}&role=black`;

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content invite-modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="invite-icon-badge">
            <Share2 size={24} color="#10b981" />
          </div>
          <h3>⚔️ Challenge a Friend</h3>
          <p>Share the link below with your friend to play in real-time:</p>
        </div>

        {/* Link Box */}
        <div className="invite-link-container">
          <input
            type="text"
            readOnly
            value={inviteUrl}
            className="invite-link-input"
            onClick={(e) => (e.target as HTMLInputElement).select()}
          />
          <button className={`btn-copy-link ${copied ? 'copied' : ''}`} onClick={handleCopy}>
            {copied ? (
              <>
                <Check size={16} />
                <span>Tersalin!</span>
              </>
            ) : (
              <>
                <Copy size={16} />
                <span>Salin Link</span>
              </>
            )}
          </button>
        </div>

        {/* Room Status Indicator */}
        <div className={`invite-status-card ${opponentConnected ? 'connected' : 'waiting'}`}>
          <div className="status-indicator-dot"></div>
          <div className="status-text-info">
            {opponentConnected ? (
              <>
                <div className="status-title">🟢 Lawan Telah Bergabung!</div>
                <div className="status-subtitle">Permainan sudah dimulai. Anda bermain sebagai Putih (White).</div>
              </>
            ) : (
              <>
                <div className="status-title">⏳ Menunggu lawan membuka link...</div>
                <div className="status-subtitle">Kirim tautan di atas melalui WhatsApp, Telegram, atau Discord.</div>
              </>
            )}
          </div>
        </div>

        <div className="invite-tips">
          <Sparkles size={16} color="#fbbf24" />
          <span>Lawan Anda otomatis akan bermain sebagai <strong>Hitam (Black)</strong> dan papan catur mereka otomatis menghadap sisi mereka.</span>
        </div>

        <div className="modal-actions">
          <button className="btn-primary" onClick={onClose}>
            {opponentConnected ? 'Mulai Bermain!' : 'Tutup'}
          </button>
        </div>
      </div>
    </div>
  );
};
