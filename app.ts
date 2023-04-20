import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { MyError } from "./utils/errors.utils";
import {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketData,
  UserSocket,
} from "./utils/interfaces.utils";

// Initialize event source
const eventsource = require("eventsource");

global.EventSource = eventsource;

// Initialize websocket server
const app = express();
export const httpServer = createServer(app);
export const io = new Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>(httpServer, {
  cors: {
    origin: "*",
  },
  maxHttpBufferSize: 1e7, // 10MB
});

// Relation between idUser and idSocket
export const userSockets: Record<string, UserSocket> = {}; // { userId: {socket: socketId, room: room} }
// Set channels member
export const userChannels: Record<string, string> = {};

// Import Middlewares
import socketMiddlewares from "./middlewares/index.middleware";

// Import Controllers
import socketControllers from "./events";

// Websocket Manager
io.on("connection", (socket) => {
  socketMiddlewares(socket);
  socketControllers(socket);

  // Manage Error
  socket.on("error", (err) => {
    const myError = <MyError>err;
    const error = { error: myError.name, event: myError.event };

    socket.emit("error", error);
  });

  // Client disconnection
  socket.on("disconnect", () => {
    // Remove user
    let userId = Object.keys(userSockets).find(
      (key) => userSockets[key].socket === socket.id
    );

    if (userId) {
      delete userSockets[userId];
      delete userChannels[userId];
    }
  });
});
