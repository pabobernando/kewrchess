import React, { useState } from 'react';
import type { GameState } from '../types/chess';
import { Flag, Handshake, RotateCcw, Terminal, Plus, X, RefreshCw, Share2, Users } from 'lucide-react';

interface GameControlsProps {
  state: GameState;
  category: 'rapid' | 'blitz' | 'bullet';
  onSelectCategory: (cat: 'rapid' | 'blitz' | 'bullet') => void;
  onFlipBoard: () => void;
  onResign: () => void;
  onOfferDraw: () => void;
  onAcceptDraw: () => void;
  onDeclineDraw: () => void;
  onNewGame: (whiteAddr: string, blackAddr: string) => void;
  onResetBoard: () => void;
  onOpenInvite: () => void;
  onOpenMatchmaking?: () => void;
}

export const GameControls: React.FC<GameControlsProps> = ({
  state,
  category,
  onSelectCategory,
  onFlipBoard,
  onResign,
  onOfferDraw,
  onAcceptDraw,
  onDeclineDraw,
  onNewGame,
  onResetBoard,
  onOpenInvite,
  onOpenMatchmaking,
}) => {
  const [showCliModal, setShowCliModal] = useState(false);
  const [showNewGameModal, setShowNewGameModal] = useState(false);
  const [whiteInput, setWhiteInput] = useState(state.white);
  const [blackInput, setBlackInput] = useState(state.black);
  const [copiedCli, setCopiedCli] = useState(false);

  const lastMove = state.moveHistory[state.moveHistory.length - 1];

  const generateLastMoveCli = () => {
    if (!lastMove) {
      return `# Belum ada langkah yang dieksekusi.\n# Contoh langkah awal:\ngno call gno.land/r/g1g7dna0gp4nec5rza4q25htj0cjgswrxefp37ep/kewrchess MakeMove \\\n  --args "${state.white}" \\\n  --args ${state.id} \\\n  --args 6 --args 4 \\\n  --args 4 --args 4`;
    }

    const caller = lastMove.piece >= 'A' && lastMove.piece <= 'Z' ? state.white : state.black;
    if (lastMove.promotion) {
      return `gno call gno.land/r/g1g7dna0gp4nec5rza4q25htj0cjgswrxefp37ep/kewrchess MakeMovePromote \\\n  --args "${caller}" \\\n  --args ${state.id} \\\n  --args ${lastMove.from[0]} --args ${lastMove.from[1]} \\\n  --args ${lastMove.to[0]} --args ${lastMove.to[1]} \\\n  --args "${lastMove.promotion}"`;
    }

    return `gno call gno.land/r/g1g7dna0gp4nec5rza4q25htj0cjgswrxefp37ep/kewrchess MakeMove \\\n  --args "${caller}" \\\n  --args ${state.id} \\\n  --args ${lastMove.from[0]} --args ${lastMove.from[1]} \\\n  --args ${lastMove.to[0]} --args ${lastMove.to[1]}`;
  };

  const copyCli = () => {
    navigator.clipboard.writeText(generateLastMoveCli());
    setCopiedCli(true);
    setTimeout(() => setCopiedCli(false), 2000);
  };

  const handleStartNewGame = (e: React.FormEvent) => {
    e.preventDefault();
    onNewGame(whiteInput.trim(), blackInput.trim());
    setShowNewGameModal(false);
  };

  // Group moves into pairs (1. e4 e5, 2. Nf3 Nc6...)
  const movePairs: { num: number; white?: string; black?: string }[] = [];
  for (let i = 0; i < state.moveHistory.length; i += 2) {
    movePairs.push({
      num: Math.floor(i / 2) + 1,
      white: state.moveHistory[i]?.san,
      black: state.moveHistory[i + 1]?.san,
    });
  }

  return (
    <div className="gno-options-panel">
      {/* Category Selection Card (from options.html) */}
      <div className="gno-category-card">
        <div className="gno-cat-header">
          <span className="gno-cat-label">Time Control Category</span>
          <span className="gno-cat-active-pill">{category.toUpperCase()}</span>
        </div>

        <div className="gno-category-switcher">
          <button
            className={`gno-cat-btn ${category === 'rapid' ? 'active' : ''}`}
            onClick={() => onSelectCategory('rapid')}
          >
            Rapid (10m)
          </button>
          <button
            className={`gno-cat-btn ${category === 'blitz' ? 'active' : ''}`}
            onClick={() => onSelectCategory('blitz')}
          >
            Blitz (3m)
          </button>
          <button
            className={`gno-cat-btn ${category === 'bullet' ? 'active' : ''}`}
            onClick={() => onSelectCategory('bullet')}
          >
            Bullet (1m)
          </button>
        </div>
      </div>

      {/* Action Controls Card (from controls.html) */}
      <div className="gno-actions-card">
        <div className="gno-actions-grid">
          <button className="gno-btn-action" onClick={onFlipBoard} title="Flip Perspective">
            <RotateCcw size={15} />
            <span>Flip Board</span>
          </button>

          <button className="gno-btn-action" onClick={() => setShowCliModal(true)} title="Gno CLI Command">
            <Terminal size={15} />
            <span>Gno CLI</span>
          </button>

          {state.status === 'PLAYING' && (
            <>
              {state.drawOfferedBy ? (
                <div className="gno-draw-response-actions">
                  <button className="gno-btn-action btn-green" onClick={onAcceptDraw}>
                    <Handshake size={15} />
                    <span>Terima Remis</span>
                  </button>
                  <button className="gno-btn-action" onClick={onDeclineDraw}>
                    <X size={15} />
                    <span>Tolak</span>
                  </button>
                </div>
              ) : (
                <button className="gno-btn-action" onClick={onOfferDraw} title="Offer Draw">
                  <Handshake size={15} />
                  <span>Offer Draw</span>
                </button>
              )}

              <button className="gno-btn-action btn-red" onClick={onResign} title="Resign Match">
                <Flag size={15} />
                <span>Resign</span>
              </button>
            </>
          )}

          <button className="gno-btn-action gno-btn-full" onClick={onOpenInvite} title="Share room invite link">
            <Share2 size={15} />
            <span>Challenge a Friend (Share Link)</span>
          </button>

          {onOpenMatchmaking && (
            <button className="gno-btn-action gno-btn-full" onClick={onOpenMatchmaking} title="On-chain JoinQueue matchmaking">
              <Users size={15} />
              <span>Find Match (JoinQueue)</span>
            </button>
          )}

          <button className="gno-btn-action gno-btn-primary" onClick={() => setShowNewGameModal(true)}>
            <Plus size={15} />
            <span>Game Baru</span>
          </button>

          <button className="gno-btn-action" onClick={onResetBoard} title="Reset to start position">
            <RefreshCw size={15} />
            <span>Reset Posisi</span>
          </button>
        </div>
      </div>

      {/* Move History Section (Authentic GnoChess fen.html Pill List) */}
      <div className="gno-fen-history-card">
        <div className="gno-fen-header">
          <span className="gno-fen-title">Move History (SAN)</span>
          <span className="gno-fen-count">{state.moveHistory.length} moves</span>
        </div>

        <div className="gno-fen-scroll">
          {movePairs.length === 0 ? (
            <div className="gno-fen-empty">Klik bidak untuk memulai langkah pertama!</div>
          ) : (
            <ul className="gno-fen-list">
              {movePairs.map((p) => (
                <li key={`move-${p.num}`} className="gno-fen-pill">
                  <div className="gno-fen-num">{p.num}</div>
                  <div className="gno-fen-move">
                    <span className="fen-dot fen-dot-white" />
                    <span>{p.white}</span>
                  </div>
                  <div className="gno-fen-move">
                    {p.black && (
                      <>
                        <span className="fen-dot fen-dot-black" />
                        <span>{p.black}</span>
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* CLI Command Modal */}
      {showCliModal && (
        <div className="modal-backdrop" onClick={() => setShowCliModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>💻 Gno CLI Smart Contract Call</h3>
              <button className="btn-close" onClick={() => setShowCliModal(false)}>
                <X size={18} />
              </button>
            </div>
            <p className="modal-desc">
              Perintah terminal untuk mereplikasi langkah terakhir di blockchain node Gno:
            </p>
            <pre className="cli-code-block">{generateLastMoveCli()}</pre>
            <div className="modal-footer">
              <button className="gno-btn-action gno-btn-primary" onClick={copyCli}>
                {copiedCli ? 'Tersalin ke Clipboard!' : 'Salin Perintah CLI'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Game Custom Addresses Modal */}
      {showNewGameModal && (
        <div className="modal-backdrop" onClick={() => setShowNewGameModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>⚔️ Mulai Pertandingan Catur Baru</h3>
              <button className="btn-close" onClick={() => setShowNewGameModal(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleStartNewGame} className="new-game-form">
              <div className="form-group">
                <label>Alamat Pemain Putih (White):</label>
                <input
                  type="text"
                  value={whiteInput}
                  onChange={(e) => setWhiteInput(e.target.value)}
                  placeholder="g1..."
                  required
                />
              </div>
              <div className="form-group">
                <label>Alamat Pemain Hitam (Black):</label>
                <input
                  type="text"
                  value={blackInput}
                  onChange={(e) => setBlackInput(e.target.value)}
                  placeholder="g1..."
                  required
                />
              </div>
              <div className="modal-footer">
                <button type="submit" className="gno-btn-action gno-btn-primary">
                  Mulai Permainan Baru
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameControls;
