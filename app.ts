import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { MyError } from "./utils/errors.utils";

// Initialize Websocket types
interface ClientToServerEvents {
  "new-message": (data: object) => void;
}
interface ServerToClientEvents {
  error: (data: object) => void;
}
interface InterServerEvents {}
interface SocketData {
  eventTriggered: string | undefined;
  userId: string | undefined;
}

// Initialize websocket server
const app = express();
export const httpServer = createServer(app);
const io = new Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>(httpServer, {
  cors: {
    origin: "*",
  },
});

// Import Middlewares
import socketMiddlewares from "./middlewares/websocket.middlewars";

// Import Controllers
import socketControllers from "./events";

// Websocket Manager
io.on("connection", (socket) => {
  socketMiddlewares(socket);
  socketControllers(io, socket);

  // Manage Error
  socket.on("error", (err) => {
    const myError = <MyError>err;
    const error = { error: myError.name, event: myError.event };

    socket.emit("error", error);
  });

  // Client disconnection
  socket.on("disconnect", () => {});
});
