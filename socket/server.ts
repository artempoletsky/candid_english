
// import { logNextSide } from "app/api/chat";

import { createServer } from "http";

const httpServer = createServer((req, res) => {
  // Handle HTTP requests if needed
});

import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({
  server: httpServer,
});

wss.on('connection', function connection(ws) {
  ws.on('error', console.error);

  ws.on('message', function message(data) {
    console.log('received: %s', data);
  });

  ws.send('something');
});

httpServer.listen(3001, () => {
  console.log("Websocket server is listening");
});