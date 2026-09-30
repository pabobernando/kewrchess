import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';

const port = process.env.PORT || 8080;
const server = createServer((req, res) => {
  if (req.url === '/health' || req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', service: 'kewrchess-relay' }));
    return;
  }
  res.writeHead(404);
  res.end();
});

const wss = new WebSocketServer({ server });
const rooms = new Map();

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
        rooms.get(currentRoom).add(ws);
      } else {
        if (!rooms.has(targetRoom)) {
          rooms.set(targetRoom, new Set());
        }
        rooms.get(targetRoom).add(ws);
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
      rooms.get(currentRoom).delete(ws);
      if (rooms.get(currentRoom).size === 0) {
        rooms.delete(currentRoom);
      }
    }
  });
});

server.listen(port, () => {
  console.log(`[KewrChess Relay] Server listening on port ${port}`);
});
