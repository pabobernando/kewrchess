import React from 'react';
import { BookOpen, Shield, Code2, Coins, ExternalLink, HelpCircle, CheckCircle, Terminal } from 'lucide-react';

interface AboutViewProps {
  onPlayNow: () => void;
}

export const AboutView: React.FC<AboutViewProps> = ({ onPlayNow }) => {
  return (
    <div className="about-view">
      {/* Header Banner */}
      <section className="about-header-card">
        <div className="about-header-badge">
          <BookOpen size={15} />
          <span>Panduan & Arsitektur</span>
        </div>
        <h1 className="about-title">Tentang KewrChess & Gno.land</h1>
        <p className="about-subtitle">
          KewrChess adalah implementasi server catur web3 on-chain di atas ekosistem Gno.land. 
          Dirancang untuk mendemonstrasikan keandalan smart contract Gno untuk aplikasi terdesentralisasi interaktif.
        </p>
      </section>

      {/* Grid of Information */}
      <div className="about-grid">
        {/* Card 1: FIDE Rules Engine */}
        <div className="about-card">
          <div className="about-card-icon icon-emerald">
            <Shield size={22} />
          </div>
          <h3 className="about-card-title">Mesin Aturan FIDE Lengkap</h3>
          <p className="about-card-text">
            KewrChess mengimplementasikan seluruh aturan resmi dari FIDE Handbook:
          </p>
          <ul className="about-feature-list">
            <li>
              <CheckCircle size={15} className="check-icon" />
              <span><strong>Rokade (Castling):</strong> Kingside (O-O) & Queenside (O-O-O) dengan syarat raja tidak sedang diskak.</span>
            </li>
            <li>
              <CheckCircle size={15} className="check-icon" />
              <span><strong>En Passant:</strong> Penangkapan pion lawan yang melangkah 2 petak langsung pada giliran berikutnya.</span>
            </li>
            <li>
              <CheckCircle size={15} className="check-icon" />
              <span><strong>Promosi Pion:</strong> Pilihan promosi ke Ratu, Benteng, Gajah, atau Kuda saat pion mencapai baris terakhir.</span>
            </li>
            <li>
              <CheckCircle size={15} className="check-icon" />
              <span><strong>Kondisi Akhir:</strong> Skakmat, Stalemate (pat), dan penawaran remis mutual.</span>
            </li>
          </ul>
        </div>

        {/* Card 2: Architecture */}
        <div className="about-card">
          <div className="about-card-icon icon-indigo">
            <Code2 size={22} />
          </div>
          <h3 className="about-card-title">Arsitektur Gno.land</h3>
          <p className="about-card-text">
            Sistem dipisahkan menjadi komponen yang modular dan efisien:
          </p>
          <ul className="about-feature-list">
            <li>
              <CheckCircle size={15} className="check-icon" />
              <span><strong>Package (Domain Logic):</strong> Engine catur murni dan stateless untuk validasi langkah.</span>
            </li>
            <li>
              <CheckCircle size={15} className="check-icon" />
              <span><strong>Realm (Smart Contract):</strong> Kontrak stateful di <code>gno.land/r/g1g7dna0gp4nec5rza4q25htj0cjgswrxefp37ep/kewrchess</code> untuk mencatat state dan hasil game.</span>
            </li>
            <li>
              <CheckCircle size={15} className="check-icon" />
              <span><strong>Frontend (React 19 + Vite):</strong> Client modern tanpa dependensi Hugo, cepat, dan responsif.</span>
            </li>
            <li>
              <CheckCircle size={15} className="check-icon" />
              <span><strong>Realtime Layer:</strong> P2P BroadcastChannel & WebSocket relay untuk multiplayer tanpa latensi.</span>
            </li>
          </ul>
        </div>

        {/* Card 3: Adena Wallet & Faucet */}
        <div className="about-card">
          <div className="about-card-icon icon-amber">
            <Coins size={22} />
          </div>
          <h3 className="about-card-title">Dompet Adena & Testnet Gas</h3>
          <p className="about-card-text">
            Untuk bertransaksi on-chain di Gno.land, Anda membutuhkan dompet Adena dan sedikit gas (<code>ugnot</code>).
          </p>
          <div className="about-steps">
            <div className="step-item">
              <span className="step-num">1</span>
              <span>Pasang ekstensi browser <strong>Adena Wallet</strong> dari <a href="https://adena.app" target="_blank" rel="noreferrer" className="link-inline">adena.app <ExternalLink size={12} /></a></span>
            </div>
            <div className="step-item">
              <span className="step-num">2</span>
              <span>Hubungkan ke Localhost atau Gno.land Testnet.</span>
            </div>
            <div className="step-item">
              <span className="step-num">3</span>
              <span>Gunakan faucet lokal jika menjalankan node dev mandiri:</span>
            </div>
            <div className="code-snippet">
              <Terminal size={14} />
              <code>make run.faucet</code>
            </div>
          </div>
        </div>

        {/* Card 4: How to Play Online Challenge */}
        <div className="about-card">
          <div className="about-card-icon icon-rose">
            <HelpCircle size={22} />
          </div>
          <h3 className="about-card-title">Cara Menantang Teman</h3>
          <p className="about-card-text">
            Anda dapat bermain langsung dengan teman di perangkat berbeda dalam beberapa detik:
          </p>
          <ol className="about-numbered-list">
            <li>Buka tab <strong>Arena (Play)</strong>.</li>
            <li>Klik tombol <strong>Tantang Teman (Share Link)</strong> di kontrol game.</li>
            <li>Salin link tantangan (misal: <code>?room=xyz&role=black</code>).</li>
            <li>Kirim link ke teman Anda — papan akan otomatis tersinkronisasi saat lawan membuka link!</li>
          </ol>
          <button className="btn-about-play" onClick={onPlayNow}>
            Mulai Bertanding Sekarang
          </button>
        </div>
      </div>
    </div>
  );
};
