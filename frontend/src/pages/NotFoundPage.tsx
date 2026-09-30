import React from 'react';
import { useLocation } from 'wouter';
import { Home } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  const [, setLocation] = useLocation();

  return (
    <div style={{
      maxWidth: '600px',
      margin: '4rem auto',
      padding: '3rem 2rem',
      textAlign: 'center',
      background: 'rgba(30, 41, 59, 0.7)',
      borderRadius: '16px',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      backdropFilter: 'blur(12px)',
    }}>
      <h1 style={{ fontSize: '4rem', margin: '0 0 1rem 0', color: '#f59e0b', fontWeight: 800 }}>404</h1>
      <h2 style={{ fontSize: '1.5rem', color: '#f8fafc', marginBottom: '1rem' }}>Halaman Tidak Ditemukan</h2>
      <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginBottom: '2rem' }}>
        Langkah yang Anda tuju keluar dari petak papan catur. Silakan kembali ke beranda KewrChess.
      </p>
      <button
        className="gno-btn-play-now"
        style={{ margin: '0 auto', justifyContent: 'center' }}
        onClick={() => setLocation('/')}
      >
        <Home size={18} />
        <span>Kembali ke Beranda</span>
      </button>
    </div>
  );
};
