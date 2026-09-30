import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Swords, ArrowRight, Shield, Zap, Trophy } from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import { MatchmakingModal } from '../components/MatchmakingModal';

export const HomePage: React.FC = () => {
  const [, setLocation] = useLocation();
  const { connectedAddress, connectWallet } = useWallet();
  const [isMatchmakingOpen, setIsMatchmakingOpen] = useState(false);

  const handleCreateChallenge = () => {
    const randomRoom = 'kewr-' + Math.random().toString(36).substring(2, 7);
    setLocation(`/play?room=${randomRoom}&role=white&invite=true`);
  };

  const handleOpenDashboard = () => {
    setLocation('/dashboard');
  };

  const handleOpenAbout = () => {
    setLocation('/about');
  };

  return (
    <div className="gno-home-container">
      {/* 2-Column Hero Grid matching GnoChess Hugo index.html */}
      <div className="gno-hero-grid">
        {/* Left Column: Title, Banner, Subtitle, Play Now CTA */}
        <div className="gno-hero-left">
          <h1 className="gno-hero-title">
            Chess: <br />
            The Gnolang Way
          </h1>

          {/* Banner from GnoChess partials/gui/banner.html */}
          <div className="gno-banner-pill">
            <span className="gno-banner-badge">ON-CHAIN BETA</span>
            <span className="gno-banner-text">
              Decentralized Chess on Gno.land — Real-Time Speed, Cryptographic Truth.
            </span>
          </div>

          <h2 className="gno-hero-subtitle">
            Every move is strategic. Every victory is immutable. Outsmart opponents in real-time, 
            settle matches cryptographically on Gno.land smart contracts, and forge your grandmaster 
            legacy on the blockchain.
          </h2>

          <div className="gno-hero-actions">
            {/* Find Match (On-Chain) */}
            <button className="gno-btn-play-now" onClick={() => setIsMatchmakingOpen(true)}>
              <span className="play-label">Find Match (On-Chain)</span>
              <span className="play-icon-circle">
                <svg width="14" height="15" viewBox="0 0 20 22" fill="none">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M17.594 8.213L5.52906 0.901262C3.50916 -0.322106 0.995605 1.22568 0.995605 3.6885V18.3112C0.995605 20.7773 3.50916 22.3219 5.52906 21.0985L17.594 13.7904C19.629 12.5574 19.629 9.44599 17.594 8.213Z"
                    fill="#ffffff"
                  />
                </svg>
              </span>
            </button>

            <button className="gno-btn-challenge" onClick={handleCreateChallenge}>
              <Swords size={16} />
              <span>Challenge a Friend</span>
            </button>

            <button className="gno-link-rules" onClick={handleOpenAbout}>
              Game rules
            </button>
          </div>
        </div>

        {/* Right Column: Interactive Visual Showcase matching GnoChess aesthetic */}
        <div className="gno-hero-right">
          <div className="gno-showcase-card">
            <div className="gno-mascot-badge">
              <img
                src="/img/mini-gopher.png"
                alt="Gno Gopher"
                className="gno-mascot-img"
              />
              <div className="gno-mascot-info">
                <span className="gno-mascot-name">Gno.land Realm</span>
                <span className="gno-mascot-role">r/demo/kewrchess</span>
              </div>
            </div>

            {/* Decorative Mini Chessboard */}
            <div className="gno-mini-board-preview">
              <div className="mini-board-grid">
                {/* 8x8 squares mini visual */}
                {Array.from({ length: 64 }).map((_, i) => {
                  const row = Math.floor(i / 8);
                  const col = i % 8;
                  const isBlackSquare = (row + col) % 2 === 1;

                  // Sample piece positions for preview
                  let pieceImg = null;
                  if (row === 0 && col === 4) pieceImg = '/img/images/pieces/merida/bK.svg';
                  if (row === 0 && col === 3) pieceImg = '/img/images/pieces/merida/bQ.svg';
                  if (row === 1 && col === 4) pieceImg = '/img/images/pieces/merida/bP.svg';
                  if (row === 6 && col === 4) pieceImg = '/img/images/pieces/merida/wP.svg';
                  if (row === 7 && col === 4) pieceImg = '/img/images/pieces/merida/wK.svg';
                  if (row === 7 && col === 6) pieceImg = '/img/images/pieces/merida/wN.svg';

                  return (
                    <div
                      key={i}
                      className={`mini-cell ${isBlackSquare ? 'mini-cell-dark' : 'mini-cell-light'}`}
                    >
                      {pieceImg && (
                        <img
                          src={pieceImg}
                          alt="preview piece"
                          className="mini-piece-img"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="gno-showcase-footer">
              <div className="showcase-stat">
                <span className="showcase-stat-num">FIDE</span>
                <span className="showcase-stat-sub">Official Rules</span>
              </div>
              <div className="showcase-divider" />
              <div className="showcase-stat">
                <span className="showcase-stat-num">Adena</span>
                <span className="showcase-stat-sub">Web3 Signer</span>
              </div>
              <div className="showcase-divider" />
              <div className="showcase-stat">
                <span className="showcase-stat-num">0ms</span>
                <span className="showcase-stat-sub">P2P Realtime</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Grid with Gno Minimalist Cards */}
      <section className="gno-features-container">
        <div className="gno-section-title-wrap">
          <h2 className="gno-features-heading">Architecture & Rules</h2>
          <div className="gno-heading-line"></div>
        </div>

        <div className="gno-features-row">
          <div className="gno-card-feature">
            <div className="gno-card-icon">
              <Shield size={22} color="#ffffff" />
            </div>
            <h3 className="gno-card-heading">On-Chain State</h3>
            <p className="gno-card-text">
              Every chess move is validated by the Gno realm contract. State history, clock management, 
              and results are verifiably saved in the immutable state tree.
            </p>
          </div>

          <div className="gno-card-feature">
            <div className="gno-card-icon">
              <Zap size={22} color="#ffffff" />
            </div>
            <h3 className="gno-card-heading">Instant Multiplayer</h3>
            <p className="gno-card-text">
              Zero-latency moves between players with local peer-to-peer relay and WebSocket synchronization.
              Create and share challenge rooms with a single click.
            </p>
          </div>

          <div className="gno-card-feature">
            <div className="gno-card-icon">
              <Trophy size={22} color="#ffffff" />
            </div>
            <h3 className="gno-card-heading">Glicko-2 Leaderboard</h3>
            <p className="gno-card-text">
              Competitive skill rating calculated per match for Rapid (10+0), Blitz (3+2), and Bullet (1+0) time controls.
            </p>
            <button className="gno-card-action" onClick={handleOpenDashboard}>
              View Leaderboard <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </section>

      {/* On-Chain Matchmaking Modal (JoinQueue) */}
      <MatchmakingModal
        isOpen={isMatchmakingOpen}
        connectedAddress={connectedAddress}
        onConnectWallet={connectWallet}
        onClose={() => setIsMatchmakingOpen(false)}
      />
    </div>
  );
};
