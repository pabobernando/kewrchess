/**
 * Real-Time WebSocket Service for KewrChess
 * 
 * Menghubungkan pemain antar-browser (Chrome, Chromium, Firefox, Safari, Mobile)
 * melalui WebSocket relay server (/chess-ws) serta fallback BroadcastChannel.
 */

export type WsStatus = 'CONNECTING' | 'CONNECTED' | 'DISCONNECTED' | 'ERROR';

export interface ChessMoveEvent {
  type: 'MOVE' | 'RESIGN' | 'OFFER_DRAW' | 'ACCEPT_DRAW' | 'DECLINE_DRAW' | 'RESET' | 'JOIN_ROOM' | 'READY' | 'UPDATE_PLAYER';
  gameId: number | string;
  roomId?: string;
  from?: [number, number];
  to?: [number, number];
  promoPiece?: string;
  sender: string;
  senderAddress?: string;
  playerRole?: 'white' | 'black';
  timestamp: number;
}

export type MoveCallback = (event: ChessMoveEvent) => void;

class ChessWebSocketService {
  private socket: WebSocket | null = null;
  private broadcastChannel: BroadcastChannel | null = null;
  private currentRoomId: string = 'default';
  private listeners: Set<MoveCallback> = new Set();
  private statusListeners: Set<(status: WsStatus) => void> = new Set();
  private status: WsStatus = 'DISCONNECTED';
  private reconnectTimer: any = null;

  constructor() {
    this.initBroadcastChannel('default');
  }

  public initBroadcastChannel(roomId: string) {
    this.currentRoomId = roomId;
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.close();
      } catch {
        // ignore
      }
    }
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      this.broadcastChannel = new BroadcastChannel(`kewrchess_room_${roomId}`);
      this.broadcastChannel.onmessage = (e) => {
        if (e.data && e.data.type) {
          this.notifyListeners(e.data);
        }
      };
    }
  }

  public setRoom(roomId: string) {
    this.currentRoomId = roomId;
    this.initBroadcastChannel(roomId);
    this.sendJoinRoom();
  }

  public getRoom(): string {
    return this.currentRoomId;
  }

  public getStatus(): WsStatus {
    return this.status;
  }

  private setStatus(status: WsStatus) {
    this.status = status;
    this.statusListeners.forEach((fn) => fn(status));
  }

  public onStatusChange(callback: (status: WsStatus) => void): () => void {
    this.statusListeners.add(callback);
    callback(this.status);
    return () => this.statusListeners.delete(callback);
  }

  public onMove(callback: MoveCallback): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private notifyListeners(event: ChessMoveEvent) {
    this.listeners.forEach((listener) => {
      try {
        listener(event);
      } catch (err) {
        console.error('Error in move listener:', err);
      }
    });
  }

  private getDefaultWsUrl(): string {
    if (import.meta.env.VITE_WS_URL) {
      return import.meta.env.VITE_WS_URL;
    }
    if (typeof window === 'undefined') return 'ws://127.0.0.1:5173/chess-ws';
    const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${proto}//${window.location.host}/chess-ws`;
  }

  public connect(url?: string) {
    const wsUrl = url || this.getDefaultWsUrl();

    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      return;
    }

    this.setStatus('CONNECTING');

    try {
      this.socket = new WebSocket(wsUrl);

      this.socket.onopen = () => {
        console.log('♟️ KewrChess WebSocket Connected:', wsUrl);
        this.setStatus('CONNECTED');
        clearTimeout(this.reconnectTimer);
        this.sendJoinRoom();
      };

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data && data.type) {
            this.notifyListeners(data);
          }
        } catch {
          // ignore non-json
        }
      };

      this.socket.onerror = (err) => {
        console.warn('WebSocket connection notice:', err);
        this.setStatus('ERROR');
      };

      this.socket.onclose = () => {
        this.setStatus('DISCONNECTED');
        // Auto-reconnect after 3 seconds
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = setTimeout(() => {
          this.connect(wsUrl);
        }, 3000);
      };
    } catch (err) {
      console.warn('Failed to create WebSocket:', err);
      this.setStatus('DISCONNECTED');
    }
  }

  private sendJoinRoom() {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      try {
        this.socket.send(
          JSON.stringify({
            type: 'JOIN_ROOM',
            roomId: this.currentRoomId,
            sender: 'handshake',
            timestamp: Date.now(),
          })
        );
      } catch {
        // ignore
      }
    }
  }

  public broadcastMove(event: ChessMoveEvent) {
    const payload = {
      ...event,
      roomId: this.currentRoomId,
    };

    // 1. Broadcast via local BroadcastChannel
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage(payload);
      } catch {
        // ignore
      }
    }

    // 2. Broadcast via WebSocket Server (cross-browser: Chrome, Chromium, Firefox, etc.)
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      try {
        this.socket.send(JSON.stringify(payload));
      } catch (e) {
        console.warn('Failed to broadcast move over socket:', e);
      }
    }
  }

  public disconnect() {
    clearTimeout(this.reconnectTimer);
    if (this.socket) {
      try {
        this.socket.close();
      } catch {
        // ignore
      }
      this.socket = null;
    }
    this.setStatus('DISCONNECTED');
  }
}

export const wsService = new ChessWebSocketService();
