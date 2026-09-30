import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Swords, Users, ArrowLeft } from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import { MatchmakingModal } from '../components/MatchmakingModal';

export const DashboardPage: React.FC = () => {
  const [, setLocation] = useLocation();
  const { connectedAddress, connectWallet } = useWallet();
  const [selectedCategory, setSelectedCategory] = useState<'rapid' | 'blitz'>('rapid');
  const [isMatchmakingOpen, setIsMatchmakingOpen] = useState(false);

  const rapidLeaderboard = [
    { rank: 1, address: 'g1g7dna0gp4nec5rza4q25htj0cjgswrxefp37ep', rating: 1845, wins: 42, losses: 10, draws: 8 },
    { rank: 2, address: 'g1kewrchessmaster999999999999999999999', rating: 1780, wins: 35, losses: 14, draws: 5 },
    { rank: 3, address: 'g1alphaknight4444444444444444444444444', rating: 1695, wins: 28, losses: 16, draws: 7 },
    { rank: 4, address: 'g1gnogopher888888888888888888888888888', rating: 1620, wins: 21, losses: 18, draws: 9 },
    { rank: 5, address: 'g1pawnstorm202677777777777777777777777', rating: 1560, wins: 15, losses: 15, draws: 4 },
  ];

  const blitzLeaderboard = [
    { rank: 1, address: 'g1kewrchessmaster999999999999999999999', rating: 1910, wins: 64, losses: 18, draws: 12 },
    { rank: 2, address: 'g1g7dna0gp4nec5rza4q25htj0cjgswrxefp37ep', rating: 1820, wins: 50, losses: 22, draws: 10 },
    { rank: 3, address: 'g1lightningking11111111111111111111111', rating: 1740, wins: 39, losses: 26, draws: 8 },
    { rank: 4, address: 'g1alphaknight4444444444444444444444444', rating: 1680, wins: 33, losses: 28, draws: 5 },
  ];

  return (
    <div className="gno-dashboard-container">
      {/* Header matching GnoChess layouts/dashboard/section.html */}
      <header className="gno-dash-header">
        <div className="gno-dash-avatar-wrapper">
          <img
            src="/img/mini-gopher.png"
            alt="my avatar"
            className="gno-dash-avatar-img"
          />
        </div>

        <div className="gno-dash-header-text">
          <h1 className="gno-dash-title">Dashboard</h1>
          <div className="gno-dash-status">
            {connectedAddress ? (
              <span className="text-connected">
                Connected – <span className="font-mono">{`${connectedAddress.slice(0, 10)}...${connectedAddress.slice(-6)}`}</span>
              </span>
            ) : (
              <span className="text-not-connected">
                Not connected –{' '}
                <button className="gno-dash-login-link" onClick={connectWallet}>
                  Login with Adena
                </button>
              </span>
            )}
          </div>
        </div>

        <div className="gno-dash-header-action" style={{ display: 'flex', gap: '0.6rem' }}>
          <button className="gno-btn-action" onClick={() => setLocation('/')} style={{ padding: '0.65rem 1rem' }}>
            <ArrowLeft size={16} />
            <span>Beranda</span>
          </button>
          <button className="gno-btn-dash-play" onClick={() => setIsMatchmakingOpen(true)}>
            <Users size={16} />
            <span>Find Match</span>
          </button>
          <button className="gno-btn-dash-play" style={{ background: '#3b82f6' }} onClick={() => setLocation('/play')}>
            <Swords size={16} />
            <span>Play Arena</span>
          </button>
        </div>
      </header>

      {/* Grid matching GnoChess article cards */}
      <section className="gno-dash-grid">
        {/* Card 1: Rapid Rating */}
        <article className="gno-dash-card">
          <h2 className="gno-dash-card-label">Rapid rating</h2>
          <div className="gno-dash-card-value">
            <span className="value-huge">42</span>
            <span className="value-unit">wins</span>
          </div>

          <div className="gno-dash-card-footer">
            <div className="footer-stats-col">
              <div className="footer-stat-line">
                <span className="stat-bullet red">•</span>
                <span>10 Losses</span>
              </div>
              <div className="footer-stat-line">
                <span className="stat-bullet amber">•</span>
                <span>8 Draws</span>
              </div>
            </div>
            <div className="footer-stat-total">60 Games</div>
          </div>
        </article>

        {/* Card 2: Blitz Rating */}
        <article className="gno-dash-card">
          <h2 className="gno-dash-card-label">Blitz rating</h2>
          <div className="gno-dash-card-value">
            <span className="value-huge">50</span>
            <span className="value-unit">wins</span>
          </div>

          <div className="gno-dash-card-footer">
            <div className="footer-stats-col">
              <div className="footer-stat-line">
                <span className="stat-bullet red">•</span>
                <span>22 Losses</span>
              </div>
              <div className="footer-stat-line">
                <span className="stat-bullet amber">•</span>
                <span>10 Draws</span>
              </div>
            </div>
            <div className="footer-stat-total">82 Games</div>
          </div>
        </article>

        {/* Card 3: Stats with Floating Trophy */}
        <article className="gno-dash-card gno-dash-card-stats">
          <h2 className="gno-dash-card-label">Stats</h2>

          <div className="gno-stats-breakdown">
            <div className="stats-metric-line">
              <span className="circle-dot dot-dark" />
              <span>65% Wins</span>
            </div>
            <div className="stats-metric-line">
              <span className="circle-dot dot-grey" />
              <span>20% Losses</span>
            </div>
            <div className="stats-metric-line">
              <span className="circle-dot dot-light" />
              <span>15% Draws</span>
            </div>
          </div>

          <img
            src="/img/images/trophy.png"
            alt="Trophy"
            className="gno-dash-trophy-img"
          />
        </article>

        {/* Card 4: Leaderboard Columns */}
        <article className="gno-dash-card gno-dash-card-leaderboard">
          <div className="gno-lb-header">
            <h2 className="gno-dash-card-label">Leaderboard</h2>
            <div className="gno-lb-tabs">
              <button
                className={`gno-lb-tab ${selectedCategory === 'rapid' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('rapid')}
              >
                Rapid
              </button>
              <button
                className={`gno-lb-tab ${selectedCategory === 'blitz' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('blitz')}
              >
                Blitz
              </button>
            </div>
          </div>

          <ol className="gno-lb-list">
            {(selectedCategory === 'rapid' ? rapidLeaderboard : blitzLeaderboard).map((item) => (
              <li key={item.address} className="gno-lb-item">
                <span className="lb-rank">{item.rank}.</span>
                <span className="lb-addr font-mono">
                  {item.address.slice(0, 12)}...{item.address.slice(-6)}
                </span>
                <span className="lb-score">{item.rating} pts</span>
              </li>
            ))}
          </ol>
        </article>
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
