import react from '@vitejs/plugin-react';
import { defineConfig, type Plugin } from 'vite';
import { WebSocketServer, WebSocket } from 'ws';

function chessWebSocketPlugin(): Plugin {
  return {
    name: 'chess-websocket-relay',
    configureServer(server) {
      if (!server.httpServer) return;

      const wss = new WebSocketServer({ noServer: true });
      const rooms = new Map<string, Set<WebSocket>>();

      server.httpServer.on('upgrade', (request, socket, head) => {
        const host = request.headers.host || 'localhost';
        const url = new URL(request.url || '', `http://${host}`);

        if (url.pathname === '/chess-ws') {
          wss.handleUpgrade(request, socket, head, (ws) => {
            wss.emit('connection', ws, request);
          });
        }
      });

      wss.on('connection', (ws) => {
        let currentRoom = 'default';

        ws.on('message', (messageRaw) => {
          try {
            const payload = JSON.parse(messageRaw.toString());
            const targetRoom = payload.roomId || currentRoom;

            if (payload.type === 'JOIN_ROOM') {
              currentRoom = targetRoom;
              if (!rooms.has(currentRoom)) {
                rooms.set(currentRoom, new Set());
              }
              rooms.get(currentRoom)!.add(ws);
            } else {
              if (!rooms.has(targetRoom)) {
                rooms.set(targetRoom, new Set());
              }
              rooms.get(targetRoom)!.add(ws);
            }

            // Broadcast message to all other players in this room
            const peers = rooms.get(targetRoom);
            if (peers) {
              for (const peer of peers) {
                if (peer !== ws && peer.readyState === WebSocket.OPEN) {
                  peer.send(messageRaw.toString());
                }
              }
            }
          } catch (err) {
            console.error('[WS Relay Error]', err);
          }
        });

        ws.on('close', () => {
          if (rooms.has(currentRoom)) {
            rooms.get(currentRoom)!.delete(ws);
            if (rooms.get(currentRoom)!.size === 0) {
              rooms.delete(currentRoom);
            }
          }
        });
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), chessWebSocketPlugin()],
});
