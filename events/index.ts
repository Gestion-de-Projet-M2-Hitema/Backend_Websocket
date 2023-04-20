import { Server, Socket } from "socket.io";
import { userChannels, userSockets } from "../app";

import { sendNotification } from "./notifications";
import { joinChannel, leaveChannel } from "./channels";
import { sendMessage } from "./messages";

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

  socket.on("leave-channel", (data) => {
    leaveChannel(io, socket, data);
  });
};

export function leaveAllRooms(socket: Socket) {
  socket.rooms.forEach((idRoom) => {
    if (idRoom === socket.id) return;
    socket.leave(idRoom);
  });

  delete userChannels[socket.data.userId];
}
