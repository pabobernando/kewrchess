import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useSearch, useLocation } from 'wouter';
import { Wallet, ArrowLeft } from 'lucide-react';
import type { GameState, PieceType } from '../types/chess';
import {
  createInitialGame,
  executeMove,
  isKingInCheck,
  isWhitePiece,
  moveHistoryToUCI,
} from '../utils/chessEngine';
import { Chessboard } from '../components/Chessboard';
import { PlayerCard } from '../components/PlayerCard';
import { GameControls } from '../components/GameControls';
import { PromotionModal } from '../components/PromotionModal';
import { StatusBanner } from '../components/StatusBanner';
import { InviteModal } from '../components/InviteModal';
import { MatchmakingModal } from '../components/MatchmakingModal';
import { useWallet } from '../context/WalletContext';
import {
  settleGameOnChain,
  confirmSettlementOnChain,
  disputeSettlementOnChain,
  startTurnTimerOnChain,
  claimTimeoutOnChain,
} from '../services/adenaService';
import {
  wsService,
  type WsStatus,
  type ChessMoveEvent,
} from '../services/websocketService';

export const PlayPage: React.FC = () => {
  const search = useSearch();
  const [, setLocation] = useLocation();
  const { connectedAddress, connectWallet, isConnecting, showToast } = useWallet();

  const [game, setGame] = useState<GameState>(createInitialGame());
  const [selectedSquare, setSelectedSquare] = useState<[number, number] | null>(null);
  const [flipped, setFlipped] = useState(false);
  const [pendingPromotion, setPendingPromotion] = useState<{
    from: [number, number];
    to: [number, number];
  } | null>(null);

  const [wsStatus, setWsStatus] = useState<WsStatus>('DISCONNECTED');
  const myClientId = useMemo(() => 'peer-' + Math.random().toString(36).substring(2, 9), []);

  const [roomId, setRoomId] = useState<string>('kewr-match');
  const [myRole, setMyRole] = useState<'white' | 'black' | 'any'>('any');
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isMatchmakingOpen, setIsMatchmakingOpen] = useState(false);
  const [opponentJoined, setOpponentJoined] = useState(false);
  const [isSettling, setIsSettling] = useState(false);
  const [isSettled, setIsSettled] = useState(false);

  // Time Control & Clocks
  const [category, setCategory] = useState<'rapid' | 'blitz' | 'bullet'>('rapid');
  const [whiteTime, setWhiteTime] = useState(600);
  const [blackTime, setBlackTime] = useState(600);

  const handleSelectCategory = (cat: 'rapid' | 'blitz' | 'bullet') => {
    setCategory(cat);
    const secs = cat === 'bullet' ? 60 : cat === 'blitz' ? 180 : 600;
    setWhiteTime(secs);
    setBlackTime(secs);
  };

  useEffect(() => {
    if (game.status !== 'PLAYING') return;

    const interval = setInterval(() => {
      if (game.isWhiteTurn) {
        setWhiteTime((prev) => (prev > 0 ? prev - 1 : 0));
      } else {
        setBlackTime((prev) => (prev > 0 ? prev - 1 : 0));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [game.status, game.isWhiteTurn]);

  // References to avoid stale state in WebSocket handlers
  const connectedAddressRef = useRef<string | null>(null);
  const myRoleRef = useRef<'white' | 'black' | 'any'>('any');
  const gameRef = useRef<GameState>(game);

  useEffect(() => {
    connectedAddressRef.current = connectedAddress;
  }, [connectedAddress]);

  useEffect(() => {
    myRoleRef.current = myRole;
  }, [myRole]);

  useEffect(() => {
    gameRef.current = game;
  }, [game]);

  useEffect(() => {
    // Parse URL query params from wouter
    const params = new URLSearchParams(search);
    const roomParam = params.get('room');
    const roleParam = params.get('role');
    const inviteParam = params.get('invite');
    const activeRoom = roomParam || ('kewr-' + Math.random().toString(36).substring(2, 7));
    const activeRole = roleParam === 'black' ? 'black' : 'white';

    setRoomId(activeRoom);
    wsService.setRoom(activeRoom);
    setMyRole(activeRole);
    myRoleRef.current = activeRole;

    if (activeRole === 'black') {
      setFlipped(true); // Flip board for black
      showToast('⚔️ Anda bergabung sebagai Hitam (Black)!');
    }

    if (inviteParam === 'true') {
      setIsInviteOpen(true);
    }

    if (connectedAddress) {
      setGame((prev) => ({
        ...prev,
        white: activeRole === 'black' ? prev.white : connectedAddress,
        black: activeRole === 'black' ? connectedAddress : prev.black,
      }));

      if (activeRole === 'black') {
        setTimeout(() => {
          wsService.broadcastMove({
            type: 'JOIN_ROOM',
            gameId: 0,
            roomId: activeRoom,
            sender: myClientId,
            senderAddress: connectedAddress || undefined,
            playerRole: 'black',
            timestamp: Date.now(),
          });
        }, 500);
      }
    }

    // Start WebSocket listener and connection
    wsService.connect();
    const unsubStatus = wsService.onStatusChange(setWsStatus);
    const unsubMove = wsService.onMove((event: ChessMoveEvent) => {
      if (event.sender === myClientId) return;

      if (event.type === 'JOIN_ROOM') {
        setOpponentJoined(true);
        if (event.senderAddress) {
          setGame((prev) => ({
            ...prev,
            black: event.senderAddress!,
          }));
          showToast(`🎉 Lawan terhubung: ${event.senderAddress.slice(0, 10)}...`);
        } else {
          showToast('🎉 Lawan telah bergabung ke dalam room!');
        }

        const hostAddr =
          connectedAddressRef.current ||
          (gameRef.current.white !== 'g1g7dna0gp4nec5rza4q25htj0cjgswrxefp37ep'
            ? gameRef.current.white
            : undefined);

        wsService.broadcastMove({
          type: 'READY',
          gameId: 0,
          sender: myClientId,
          senderAddress: hostAddr,
          playerRole: 'white',
          timestamp: Date.now(),
        });
      } else if (event.type === 'READY') {
        setOpponentJoined(true);
        if (event.senderAddress) {
          setGame((prev) => ({
            ...prev,
            white: event.senderAddress!,
          }));
        }
      } else if (event.type === 'UPDATE_PLAYER') {
        if (event.senderAddress) {
          setGame((prev) => ({
            ...prev,
            white: event.playerRole === 'white' ? event.senderAddress! : prev.white,
            black: event.playerRole === 'black' ? event.senderAddress! : prev.black,
          }));
          showToast(
            `🔗 Lawan (${event.playerRole === 'white' ? 'Putih' : 'Hitam'}) menghubungkan dompet: ${event.senderAddress.slice(0, 10)}...`
          );
        }
      } else if (event.type === 'MOVE' && event.from && event.to) {
        setGame((prevGame) => {
          const { newState } = executeMove(
            prevGame,
            event.from![0],
            event.from![1],
            event.to![0],
            event.to![1],
            event.promoPiece || 'Q'
          );
          return newState;
        });
        showToast('⚡ Lawan melangkahkan bidak (via Real-Time Sync)');
      } else if (event.type === 'RESIGN') {
        setGame((prev) => ({
          ...prev,
          status: prev.isWhiteTurn ? 'BLACK_WON' : 'WHITE_WON',
          resignedBy: event.sender,
          drawOfferedBy: '',
        }));
        showToast('🏳️ Lawan menyerah!');
      } else if (event.type === 'OFFER_DRAW') {
        setGame((prev) => ({
          ...prev,
          drawOfferedBy: event.sender,
        }));
        showToast('🤝 Lawan menawarkan remis!');
      } else if (event.type === 'ACCEPT_DRAW') {
        setGame((prev) => ({
          ...prev,
          status: 'DRAW',
          drawOfferedBy: '',
        }));
        showToast('🤝 Remis disepakati oleh lawan!');
      } else if (event.type === 'DECLINE_DRAW') {
        setGame((prev) => ({
          ...prev,
          drawOfferedBy: '',
        }));
        showToast('Tawaran remis ditolak oleh lawan.');
      }
    });

    return () => {
      unsubStatus();
      unsubMove();
      wsService.disconnect();
    };
  }, [search, connectedAddress, myClientId, showToast]);

  // Compute captured pieces
  const { capturedByWhite, capturedByBlack } = useMemo(() => {
    const whiteCaps: PieceType[] = [];
    const blackCaps: PieceType[] = [];

    game.moveHistory.forEach((m) => {
      if (m.captured) {
        if (isWhitePiece(m.piece)) {
          whiteCaps.push(m.captured);
        } else {
          blackCaps.push(m.captured);
        }
      }
    });

    return { capturedByWhite: whiteCaps, capturedByBlack: blackCaps };
  }, [game.moveHistory]);

  const isWhiteCheck = isKingInCheck(game, true);
  const isBlackCheck = isKingInCheck(game, false);

  const handleSelectSquare = (pos: [number, number] | null) => {
    if (!pos) {
      setSelectedSquare(null);
      return;
    }
    const piece = game.board[pos[0]][pos[1]];
    if (piece !== '.') {
      const isWhite = isWhitePiece(piece);
      if (myRole === 'white' && !isWhite) {
        showToast('⚠️ Anda adalah pemain Putih (White)!');
        return;
      }
      if (myRole === 'black' && isWhite) {
        showToast('⚠️ Anda adalah pemain Hitam (Black)!');
        return;
      }
    }
    setSelectedSquare(pos);
  };

  const handleMoveTo = (toRow: number, toCol: number) => {
    if (!selectedSquare) return;
    const [fromRow, fromCol] = selectedSquare;
    const piece = game.board[fromRow][fromCol];
    const isWhite = isWhitePiece(piece);

    if (myRole === 'white' && !isWhite) {
      showToast('⚠️ Anda adalah pemain Putih!');
      return;
    }
    if (myRole === 'black' && isWhite) {
      showToast('⚠️ Anda adalah pemain Hitam!');
      return;
    }

    const isPawnPromo =
      (piece === 'P' && toRow === 0) || (piece === 'p' && toRow === 7);

    if (isPawnPromo) {
      setPendingPromotion({ from: [fromRow, fromCol], to: [toRow, toCol] });
      return;
    }

    const { newState, error } = executeMove(game, fromRow, fromCol, toRow, toCol);
    if (error) {
      showToast(`⚠️ ${error}`);
      return;
    }

    setGame(newState);
    setSelectedSquare(null);

    wsService.broadcastMove({
      type: 'MOVE',
      gameId: game.id,
      from: [fromRow, fromCol],
      to: [toRow, toCol],
      sender: myClientId,
      timestamp: Date.now(),
    });

    if (newState.status === 'WHITE_WON') {
      showToast('🏆 SKAKMAT! Putih Menang!');
    } else if (newState.status === 'BLACK_WON') {
      showToast('🏆 SKAKMAT! Hitam Menang!');
    } else if (newState.status === 'DRAW') {
      showToast('🤝 Permainan Remis!');
    } else if (isKingInCheck(newState, newState.isWhiteTurn)) {
      showToast('⚠️ SKAK!');
    }
  };

  const handlePromotionSelect = (promoPiece: 'Q' | 'N' | 'R' | 'B') => {
    if (!pendingPromotion) return;
    const { from, to } = pendingPromotion;

    const { newState, error } = executeMove(game, from[0], from[1], to[0], to[1], promoPiece);
    if (error) {
      showToast(`⚠️ ${error}`);
      setPendingPromotion(null);
      return;
    }

    setGame(newState);
    setSelectedSquare(null);
    setPendingPromotion(null);

    wsService.broadcastMove({
      type: 'MOVE',
      gameId: game.id,
      from,
      to,
      promoPiece,
      sender: myClientId,
      timestamp: Date.now(),
    });

    showToast(`👑 Pion berhasil dipromosikan!`);
  };

  const handleResign = () => {
    if (game.status !== 'PLAYING') return;
    const isWhite = game.isWhiteTurn;
    const resigner = isWhite ? game.white : game.black;

    const confirmed = window.confirm(
      `Apakah Anda yakin pemain ${isWhite ? 'Putih' : 'Hitam'} ingin menyerah?`
    );
    if (!confirmed) return;

    setGame((prev) => ({
      ...prev,
      status: isWhite ? 'BLACK_WON' : 'WHITE_WON',
      resignedBy: resigner,
      drawOfferedBy: '',
    }));

    wsService.broadcastMove({
      type: 'RESIGN',
      gameId: game.id,
      sender: myClientId,
      timestamp: Date.now(),
    });

    showToast(`🏳️ Pemain ${isWhite ? 'Putih' : 'Hitam'} menyerah!`);
  };

  const handleOfferDraw = () => {
    if (game.status !== 'PLAYING') return;
    const offerer = game.isWhiteTurn ? game.white : game.black;

    if (game.drawOfferedBy === offerer) {
      showToast('Anda sudah mengajukan tawaran remis.');
      return;
    }

    if (game.drawOfferedBy && game.drawOfferedBy !== offerer) {
      setGame((prev) => ({
        ...prev,
        status: 'DRAW',
        drawOfferedBy: '',
      }));
      wsService.broadcastMove({
        type: 'ACCEPT_DRAW',
        gameId: game.id,
        sender: myClientId,
        timestamp: Date.now(),
      });
      showToast('🤝 Tawaran diterima! Permainan berakhir remis.');
      return;
    }

    setGame((prev) => ({
      ...prev,
      drawOfferedBy: offerer,
    }));
    wsService.broadcastMove({
      type: 'OFFER_DRAW',
      gameId: game.id,
      sender: myClientId,
      timestamp: Date.now(),
    });
    showToast('🤝 Tawaran remis diajukan ke lawan.');
  };

  const handleAcceptDraw = () => {
    if (!game.drawOfferedBy) return;
    setGame((prev) => ({
      ...prev,
      status: 'DRAW',
      drawOfferedBy: '',
    }));
    wsService.broadcastMove({
      type: 'ACCEPT_DRAW',
      gameId: game.id,
      sender: myClientId,
      timestamp: Date.now(),
    });
    showToast('🤝 Remis disepakati! Permainan selesai.');
  };

  const handleDeclineDraw = () => {
    setGame((prev) => ({
      ...prev,
      drawOfferedBy: '',
    }));
    wsService.broadcastMove({
      type: 'DECLINE_DRAW',
      gameId: game.id,
      sender: myClientId,
      timestamp: Date.now(),
    });
    showToast('Tawaran remis ditolak. Permainan berlanjut.');
  };

  const handleNewGame = (whiteAddr: string, blackAddr: string) => {
    const newG = createInitialGame(game.id + 1, whiteAddr, blackAddr);
    setGame(newG);
    setSelectedSquare(null);
    setIsSettled(false);
    showToast('⚔️ Game # ' + (game.id + 1) + ' dimulai!');
  };

  const handleResetBoard = () => {
    setGame(createInitialGame(game.id, game.white, game.black));
    setSelectedSquare(null);
    setIsSettled(false);
    showToast('Papan catur direset ke posisi awal.');
  };

  const handleSettleOnChain = async () => {
    if (!connectedAddress) {
      connectWallet();
      return;
    }

    if (game.status === 'PLAYING') return;

    const movesUCI = moveHistoryToUCI(game.moveHistory);
    if (!movesUCI) {
      showToast('⚠️ Belum ada riwayat langkah catur untuk diverifikasi.');
      return;
    }

    setIsSettling(true);
    try {
      const res = await settleGameOnChain(
        connectedAddress,
        game.id,
        movesUCI
      );
      if (res && (res.status === 'success' || res.data?.hash)) {
        setIsSettled(true);
        showToast('🎉 Hasil pertandingan resmi diverifikasi & dicatat on-chain di Gno.land!');
      } else {
        setIsSettled(true);
        showToast('Transaksi terkirim. Hasil pertandingan diselesaikan di blockchain.');
      }
    } catch (err: any) {
      console.error('Error settling game:', err);
      showToast(`⚠️ Gagal mencatat hasil on-chain: ${err?.message || 'Transaksi dibatalkan'}`);
    } finally {
      setIsSettling(false);
    }
  };

  const handleConfirmSettlement = async () => {
    if (!connectedAddress) {
      connectWallet();
      return;
    }
    setIsSettling(true);
    try {
      await confirmSettlementOnChain(connectedAddress, game.id);
      setIsSettled(true);
      setGame((prev) => ({
        ...prev,
        status: (prev.pendingStatus as any) || 'WHITE_WON',
      }));
      showToast('✅ Proposal kemenangan dikonfirmasi secara resmi di blockchain!');
    } catch (err: any) {
      showToast(`⚠️ Gagal konfirmasi: ${err?.message || 'Transaksi dibatalkan'}`);
    } finally {
      setIsSettling(false);
    }
  };

  const handleDisputeSettlement = async () => {
    if (!connectedAddress) {
      connectWallet();
      return;
    }
    setIsSettling(true);
    try {
      await disputeSettlementOnChain(connectedAddress, game.id);
      setGame((prev) => ({
        ...prev,
        status: 'PLAYING',
        proposedBy: '',
        pendingStatus: '',
        challengeDeadline: 0,
      }));
      showToast('🛡️ Proposal fiktif berhasil digugurkan! Permainan kembali aktif.');
    } catch (err: any) {
      showToast(`⚠️ Gagal menyanggah: ${err?.message || 'Transaksi dibatalkan'}`);
    } finally {
      setIsSettling(false);
    }
  };

  const handleStartTurnTimer = async () => {
    if (!connectedAddress) {
      connectWallet();
      return;
    }
    const movesUCI = moveHistoryToUCI(game.moveHistory);
    setIsSettling(true);
    try {
      await startTurnTimerOnChain(connectedAddress, game.id, movesUCI);
      setGame((prev) => ({
        ...prev,
        turnDeadline: Date.now() / 1000 + 120,
        turnChallengedBy: connectedAddress,
      }));
      showToast('⏱️ Timer giliran lawan aktif (2 menit)! Jika lawan tetap AFK, Anda dapat klaim menang.');
    } catch (err: any) {
      showToast(`⚠️ Gagal memulai timer giliran: ${err?.message || 'Transaksi dibatalkan'}`);
    } finally {
      setIsSettling(false);
    }
  };

  const handleClaimTimeout = async () => {
    if (!connectedAddress) {
      connectWallet();
      return;
    }
    setIsSettling(true);
    try {
      await claimTimeoutOnChain(connectedAddress, game.id);
      const isWhite = connectedAddress.toLowerCase() === game.white.toLowerCase();
      setGame((prev) => ({
        ...prev,
        status: isWhite ? 'WHITE_WON' : 'BLACK_WON',
        turnDeadline: 0,
        turnChallengedBy: '',
      }));
      setIsSettled(true);
      showToast('🏆 Kemenangan sah atas Lawan AFK (Abandonment) berhasil dicatat on-chain!');
    } catch (err: any) {
      showToast(`⚠️ Batas waktu belum habis atau transaksi dibatalkan: ${err?.message}`);
    } finally {
      setIsSettling(false);
    }
  };

  // Determine top and bottom players based on flip
  const topPlayer = flipped ? (
    <PlayerCard
      color="white"
      address={game.white}
      isTurn={game.isWhiteTurn}
      isCheck={isWhiteCheck}
      capturedPieces={capturedByWhite}
      timeLeftSeconds={whiteTime}
      roleLabel="White (Rival)"
    />
  ) : (
    <PlayerCard
      color="black"
      address={game.black}
      isTurn={!game.isWhiteTurn}
      isCheck={isBlackCheck}
      capturedPieces={capturedByBlack}
      timeLeftSeconds={blackTime}
      roleLabel="Black (Rival)"
    />
  );

  const bottomPlayer = flipped ? (
    <PlayerCard
      color="black"
      address={game.black}
      isTurn={!game.isWhiteTurn}
      isCheck={isBlackCheck}
      capturedPieces={capturedByBlack}
      timeLeftSeconds={blackTime}
      roleLabel="Black (Me)"
    />
  ) : (
    <PlayerCard
      color="white"
      address={game.white}
      isTurn={game.isWhiteTurn}
      isCheck={isWhiteCheck}
      capturedPieces={capturedByWhite}
      timeLeftSeconds={whiteTime}
      roleLabel="White (Me)"
    />
  );

  if (!connectedAddress) {
    return (
      <div className="wallet-gate-container">
        <div className="wallet-gate-card">
          <div className="wallet-gate-icon-circle">
            <Wallet size={38} />
          </div>
          <h2 className="wallet-gate-title">Connect Wallet</h2>
          <p className="wallet-gate-desc">
            Untuk masuk dan bertanding di arena catur <strong>KewrChess</strong>, Anda harus menghubungkan Adena Wallet terlebih dahulu.
          </p>
          <div className="wallet-gate-actions">
            <button
              className="gno-btn-play-now"
              style={{ justifyContent: 'center', width: '100%', padding: '0.85rem 1.6rem' }}
              onClick={connectWallet}
              disabled={isConnecting}
            >
              <span>{isConnecting ? 'Menghubungkan...' : 'Connect Adena Wallet'}</span>
            </button>
            <button
              className="gno-btn-challenge"
              style={{ justifyContent: 'center', width: '100%' }}
              onClick={() => setLocation('/')}
            >
              Kembali ke Beranda
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="gno-arena-3col-layout">
      {/* Column 1 (Left): Rival & Me Players with Giant Digital Clocks */}
      <aside className="gno-arena-players-col">
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          marginBottom: '0.4rem',
        }}>
          <button
            className="gno-btn-action"
            onClick={() => setLocation('/')}
            style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', gap: '0.35rem' }}
            title="Kembali ke Beranda"
          >
            <ArrowLeft size={14} />
            <span>Lobby</span>
          </button>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            fontSize: '0.74rem',
            padding: '0.35rem 0.75rem',
            background: 'rgba(15, 23, 42, 0.6)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            borderRadius: '999px',
            color: wsStatus === 'CONNECTED' ? '#34d399' : '#fbbf24',
          }}>
            <span style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: wsStatus === 'CONNECTED' ? '#34d399' : '#fbbf24',
            }} />
            <span>{wsStatus === 'CONNECTED' ? 'Relay Online' : 'Connecting Relay...'}</span>
          </div>
        </div>
        {topPlayer}
        {bottomPlayer}
      </aside>

      {/* Column 2 (Center): Centered Chessboard & Turn Status */}
      <div className="gno-arena-center-col">
        <StatusBanner
          state={game}
          connectedAddress={connectedAddress}
          onAcceptDraw={handleAcceptDraw}
          onDeclineDraw={handleDeclineDraw}
          onSettleOnChain={handleSettleOnChain}
          onConfirmSettlement={handleConfirmSettlement}
          onDisputeSettlement={handleDisputeSettlement}
          onClaimTimeout={handleClaimTimeout}
          isSettling={isSettling}
          isSettled={isSettled}
        />

        <div className="gno-board-card">
          <Chessboard
            state={game}
            selectedSquare={selectedSquare}
            onSelectSquare={handleSelectSquare}
            onMoveTo={handleMoveTo}
            flipped={flipped}
          />
        </div>

        {game.status === 'PLAYING' && !game.turnDeadline && connectedAddress && (
          <div style={{ textAlign: 'center', marginTop: '0.6rem' }}>
            <button
              onClick={handleStartTurnTimer}
              disabled={isSettling}
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px dashed rgba(255, 255, 255, 0.18)',
                color: '#94a3b8',
                fontSize: '0.78rem',
                padding: '0.35rem 0.85rem',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              title="Jika lawan menutup browser atau tidak kunjung melangkah, jalankan timer giliran resmi di blockchain"
            >
              ⏱️ Lawan AFK / Kabur? Aktifkan Timer Giliran On-Chain (2 Menit)
            </button>
          </div>
        )}
      </div>

      {/* Column 3 (Right): Options, Categories, Actions, and Move History */}
      <aside className="gno-arena-controls-col">
        <GameControls
          state={game}
          category={category}
          onSelectCategory={handleSelectCategory}
          onFlipBoard={() => setFlipped(!flipped)}
          onResign={handleResign}
          onOfferDraw={handleOfferDraw}
          onAcceptDraw={handleAcceptDraw}
          onDeclineDraw={handleDeclineDraw}
          onNewGame={handleNewGame}
          onResetBoard={handleResetBoard}
          onOpenInvite={() => setIsInviteOpen(true)}
          onOpenMatchmaking={() => setIsMatchmakingOpen(true)}
        />
      </aside>

      {/* Promotion Choice Modal */}
      <PromotionModal
        isOpen={Boolean(pendingPromotion)}
        isWhite={game.isWhiteTurn}
        onSelect={handlePromotionSelect}
        onCancel={() => setPendingPromotion(null)}
      />

      {/* Link Challenge Invite Modal */}
      <InviteModal
        isOpen={isInviteOpen}
        roomId={roomId}
        opponentConnected={opponentJoined}
        onClose={() => setIsInviteOpen(false)}
      />

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
