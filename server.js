const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Store connected clients with their nicknames
const clients = new Map();

wss.on('connection', (ws) => {
  console.log('New client connected');

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);

      switch (data.type) {
        case 'join':
          // Store client with nickname
          clients.set(ws, data.nickname);

          // Broadcast join message to all clients
          broadcast({
            type: 'system',
            message: `${data.nickname} присоединился к чату`,
            timestamp: new Date().toISOString()
          });

          // Send current user count
          broadcast({
            type: 'userCount',
            count: clients.size
          });
          break;

        case 'message':
          // Broadcast message to all clients
          const nickname = clients.get(ws) || 'Anonymous';
          broadcast({
            type: 'message',
            nickname: nickname,
            message: data.message,
            timestamp: new Date().toISOString()
          });
          break;
      }
    } catch (error) {
      console.error('Error parsing message:', error);
    }
  });

  ws.on('close', () => {
    const nickname = clients.get(ws);
    if (nickname) {
      // Broadcast leave message
      broadcast({
        type: 'system',
        message: `${nickname} покинул чат`,
        timestamp: new Date().toISOString()
      });

      clients.delete(ws);

      // Update user count
      broadcast({
        type: 'userCount',
        count: clients.size
      });
    }
    console.log('Client disconnected');
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

// Broadcast message to all connected clients
function broadcast(data) {
  const message = JSON.stringify(data);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
