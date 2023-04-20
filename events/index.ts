import { Server, Socket } from "socket.io";
import { userSockets } from "../app";

import { sendNotification } from "./notifications";
import { joinChannel } from "./channels";

export default (io: Server, socket: Socket) => {
  socket.on("initialize", (data) => {
    userSockets[socket.data.userId] = {
      socket: socket.id,
      room: undefined,
    };
  });

  socket.on("notification", (data) => {
    sendNotification(io, socket, data);
  });

  socket.on("join-channel", (data) => {
    joinChannel(io, socket, data);
  });
};

export function leaveAllRooms(socket: Socket) {
  socket.rooms.forEach((idRoom) => {
    if (idRoom === socket.id) return;
    socket.leave(idRoom);
  });
}
