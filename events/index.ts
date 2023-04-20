import { Server, Socket } from "socket.io";
import { userSockets } from "../app";

import { sendNotification } from "./notifications";

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
};

function leaveAllRooms(socket: Socket) {
  socket.rooms.forEach((idRoom) => {
    if (idRoom === socket.id) return;
    socket.leave(idRoom);
  });
}
