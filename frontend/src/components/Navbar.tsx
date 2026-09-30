import React from 'react';
import { Link } from 'wouter';
import { ShieldCheck, Wallet } from 'lucide-react';
import kewrChessLogo from '../assets/KewrChess.svg';
import { useWallet } from '../context/WalletContext';

export const Navbar: React.FC = () => {
  const { connectedAddress, isConnecting, connectWallet, disconnectWallet } = useWallet();
  const isConnected = Boolean(connectedAddress);

  const handleWalletClick = () => {
    if (isConnected) {
      const confirmDc = window.confirm(
        `Alamat terhubung:\n${connectedAddress}\n\nApakah Anda ingin memutuskan koneksi (Disconnect)?`
      );
      if (confirmDc) {
        disconnectWallet();
      }
    } else {
      connectWallet();
    }
  };

  return (
    <header className="gno-header">
      <div className="gno-header-inner">
        {/* Left: KewrChess Brand Logo */}
        <Link href="/" className="gno-logo-wrapper" title="KewrChess Home">
          <img
            src={kewrChessLogo}
            alt="KewrChess"
            className="kewrchess-brand-logo"
          />
        </Link>

        {/* Right: Connect Wallet Button Only */}
        <div className="gno-header-right">
          <button
            className={`gno-wallet-pill ${isConnected ? 'connected' : ''}`}
            onClick={handleWalletClick}
            disabled={isConnecting}
          >
            {isConnecting ? (
              <span>Connecting...</span>
            ) : isConnected ? (
              <>
                <ShieldCheck size={15} color="#16a34a" />
                <span className="font-mono">{`${connectedAddress!.slice(0, 8)}...${connectedAddress!.slice(-4)}`}</span>
              </>
            ) : (
              <>
                <Wallet size={15} />
                <span>Connect Adena</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
