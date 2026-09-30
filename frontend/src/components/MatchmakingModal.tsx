import React, { useState } from 'react';
import { Users, X, Loader2, Play, Ban, Terminal, CheckCircle2, AlertCircle } from 'lucide-react';
import { joinQueueOnChain, leaveQueueOnChain } from '../services/adenaService';

interface MatchmakingModalProps {
  isOpen: boolean;
  connectedAddress: string | null;
  onConnectWallet: () => void;
  onClose: () => void;
  onMatchFound?: (gameId?: number) => void;
}

export const MatchmakingModal: React.FC<MatchmakingModalProps> = ({
  isOpen,
  connectedAddress,
  onConnectWallet,
  onClose,
}) => {
  const [isInQueue, setIsInQueue] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showCli, setShowCli] = useState(false);

  if (!isOpen) return null;

  const handleJoinQueue = async () => {
    if (!connectedAddress) {
      onConnectWallet();
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setStatusMsg('Mengirim transaksi JoinQueue() ke Adena Wallet...');

    try {
      const res = await joinQueueOnChain(connectedAddress);
      if (res && (res.status === 'success' || res.data?.hash)) {
        setIsInQueue(true);
        setStatusMsg('Berhasil masuk antrean! Menunggu lawan berikutnya...');
      } else {
        setIsInQueue(true);
        setStatusMsg('Transaksi terkirim. Anda kini berada dalam antrean on-chain.');
      }
    } catch (err: any) {
      console.error('Error joining queue:', err);
      setErrorMsg(err?.message || 'Gagal masuk antrean matchmaking.');
      setStatusMsg(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLeaveQueue = async () => {
    if (!connectedAddress) return;

    setIsLoading(true);
    setErrorMsg(null);
    setStatusMsg('Mengirim transaksi LeaveQueue() ke Adena Wallet...');

    try {
      const res = await leaveQueueOnChain(connectedAddress);
      if (res && (res.status === 'success' || res.data?.hash)) {
        setIsInQueue(false);
        setStatusMsg('Berhasil keluar dari antrean matchmaking.');
      } else {
        setIsInQueue(false);
        setStatusMsg('Anda telah keluar dari antrean.');
      }
    } catch (err: any) {
      console.error('Error leaving queue:', err);
      setErrorMsg(err?.message || 'Gagal keluar dari antrean matchmaking.');
    } finally {
      setIsLoading(false);
    }
  };

  const cliJoinCmd = `gno call gno.land/r/g1g7dna0gp4nec5rza4q25htj0cjgswrxefp37ep/kewrchess JoinQueue \\\n  --args "${connectedAddress || '[your_address]'}"`;
  const cliLeaveCmd = `gno call gno.land/r/g1g7dna0gp4nec5rza4q25htj0cjgswrxefp37ep/kewrchess LeaveQueue \\\n  --args "${connectedAddress || '[your_address]'}"`;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content invite-modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
            <div className="invite-icon-badge" style={{ background: 'rgba(59, 130, 246, 0.15)' }}>
              <Users size={24} color="#3b82f6" />
            </div>
            <button className="btn-close" onClick={onClose} title="Tutup">
              <X size={18} />
            </button>
          </div>
          <h3>⚔️ On-Chain Matchmaking (`JoinQueue`)</h3>
          <p>
            Cari lawan bertanding secara otomatis di smart contract realm Gno.land.
          </p>
        </div>

        {/* Status Box */}
        <div style={{ padding: '0 1.5rem', marginBottom: '1rem' }}>
          {!connectedAddress ? (
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              borderRadius: '8px',
              padding: '1rem',
              textAlign: 'center',
            }}>
              <p style={{ color: '#f87171', fontSize: '0.9rem', marginBottom: '0.75rem' }}>
                Dompet Adena belum terhubung. Hubungkan dompet terlebih dahulu untuk masuk ke antrean on-chain.
              </p>
              <button className="gno-btn-action gno-btn-primary" style={{ margin: '0 auto' }} onClick={onConnectWallet}>
                Hubungkan Adena
              </button>
            </div>
          ) : isInQueue ? (
            <div style={{
              background: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '8px',
              padding: '1.25rem',
              textAlign: 'center',
            }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.75rem' }}>
                <Loader2 size={32} className="spin" color="#60a5fa" />
              </div>
              <h4 style={{ color: '#93c5fd', margin: '0 0 0.5rem 0', fontSize: '1.05rem' }}>
                Sedang Menunggu Lawan di Blockchain...
              </h4>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0 }}>
                Alamat Anda: <code style={{ color: '#38bdf8' }}>{`${connectedAddress.slice(0, 10)}...${connectedAddress.slice(-6)}`}</code>
              </p>
              <p style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '0.5rem' }}>
                Ketika ada pemain lain yang memanggil <code>JoinQueue()</code>, smart contract akan langsung memasangkan Anda dan memulai game.
              </p>

              <div style={{ marginTop: '1.25rem' }}>
                <button
                  className="gno-btn-action btn-red"
                  style={{ width: '100%', justifyContent: 'center', padding: '0.65rem' }}
                  onClick={handleLeaveQueue}
                  disabled={isLoading}
                >
                  <Ban size={15} />
                  <span>{isLoading ? 'Membatalkan...' : 'Batal / Keluar Antrean (LeaveQueue)'}</span>
                </button>
              </div>
            </div>
          ) : (
            <div style={{
              background: 'rgba(30, 41, 59, 0.7)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '8px',
              padding: '1.25rem',
              textAlign: 'center',
            }}>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
                Klik tombol di bawah untuk mendaftarkan alamat Anda ke antrean <code>JoinQueue()</code> di Gno.land realm.
              </p>
              <button
                className="gno-btn-play-now"
                style={{ width: '100%', justifyContent: 'center', padding: '0.85rem' }}
                onClick={handleJoinQueue}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 size={16} className="spin" />
                    <span>Memproses Transaksi...</span>
                  </>
                ) : (
                  <>
                    <Play size={16} />
                    <span>Masuk Antrean (JoinQueue)</span>
                  </>
                )}
              </button>
            </div>
          )}

          {statusMsg && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginTop: '0.75rem',
              padding: '0.6rem 0.8rem',
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              borderRadius: '6px',
              color: '#34d399',
              fontSize: '0.85rem',
            }}>
              <CheckCircle2 size={16} />
              <span>{statusMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginTop: '0.75rem',
              padding: '0.6rem 0.8rem',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              borderRadius: '6px',
              color: '#f87171',
              fontSize: '0.85rem',
            }}>
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Toggle CLI Command */}
        <div style={{ padding: '0 1.5rem', marginBottom: '1rem' }}>
          <button
            onClick={() => setShowCli(!showCli)}
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            <Terminal size={14} />
            <span>{showCli ? 'Sembunyikan Perintah Gno CLI' : 'Lihat Perintah Gno CLI'}</span>
          </button>

          {showCli && (
            <div style={{ marginTop: '0.6rem' }}>
              <pre className="cli-code-block" style={{ fontSize: '0.75rem', marginBottom: '0.5rem' }}>
                {cliJoinCmd}
              </pre>
              <pre className="cli-code-block" style={{ fontSize: '0.75rem' }}>
                {cliLeaveCmd}
              </pre>
            </div>
          )}
        </div>

        <div className="modal-footer" style={{ justifyContent: 'flex-end', padding: '0.75rem 1.5rem 1.25rem' }}>
          <button className="gno-btn-action" onClick={onClose}>
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
