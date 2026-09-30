import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { connectAdenaWallet, getConnectedAdenaAccount } from '../services/adenaService';

interface WalletContextType {
  connectedAddress: string | null;
  isConnecting: boolean;
  toastMessage: string | null;
  connectWallet: () => Promise<string | null>;
  disconnectWallet: () => void;
  showToast: (msg: string) => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [connectedAddress, setConnectedAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3500);
  }, []);

  // Check on mount if Adena is already connected
  useEffect(() => {
    getConnectedAdenaAccount().then((addr) => {
      if (addr) {
        setConnectedAddress(addr);
      }
    });
  }, []);

  const connectWallet = useCallback(async (): Promise<string | null> => {
    setIsConnecting(true);
    try {
      const res = await connectAdenaWallet();
      if (res?.address) {
        setConnectedAddress(res.address);
        showToast(`🎉 Dompet Adena terhubung: ${res.address.slice(0, 10)}...`);
        return res.address;
      }
      return null;
    } catch (err: any) {
      console.error('Wallet connection error:', err);
      showToast('⚠️ Gagal menghubungkan Adena Wallet.');
      return null;
    } finally {
      setIsConnecting(false);
    }
  }, [showToast]);

  const disconnectWallet = useCallback(() => {
    setConnectedAddress(null);
    showToast('🔌 Koneksi Adena Wallet diputuskan.');
  }, [showToast]);

  return (
    <WalletContext.Provider
      value={{
        connectedAddress,
        isConnecting,
        toastMessage,
        connectWallet,
        disconnectWallet,
        showToast,
      }}
    >
      {children}
      {toastMessage && <div className="toast-notification">{toastMessage}</div>}
    </WalletContext.Provider>
  );
};

export const useWallet = (): WalletContextType => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};
