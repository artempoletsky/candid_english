
// import { logNextSide } from "app/api/chat";

import { createServer } from "http";
import { httpListener } from "@artempoletsky/easyrpc";
import { WebSocketServer } from "ws";
import { z } from "zod";

const httpServer = createServer(httpListener({
  rules: {
    broadcast: z.object({
      message: z.string(),
    }),
  },
  api: {
    async broadcast({ message }) {
      wss.emit("message", message);
    }
  }
}));

const wss = new WebSocketServer({
  server: httpServer,
});

wss.on("connection", function connection(ws) {
  ws.on("error", console.error);

  ws.on("message", function message(data) {
    console.log("received: %s", data);
  });
  ws.send("something");
});

httpServer.listen(3001, () => {
  console.log("Websocket server is listening");
});