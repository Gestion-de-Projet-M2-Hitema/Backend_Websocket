import { Server, Socket } from "socket.io";
import { userSockets } from "../app";

export default (io: Server, socket: Socket) => {
  socket.on("initialize", (data) => {
    userSockets[socket.data.userId] = {
      socket: socket.id,
      room: undefined,
    };
  });

  socket.on("notification", (data) => {
    /*
      Data Format :
      data: {
        type: "friend" | "join-server" | "message",
        to?: idUser | idChannel,
      }
    */
    const notifTypes: string[] = [];
    const notifForUser: string[] = [];
    const notifForChannel: string[] = [];

    const error = {
      error: "invalid-data",
      event: socket.data.eventTriggered,
    };

    // Verify if data are valid
    if (!data.type || !notifTypes.includes(data.type)) {
      socket.emit("error", error);
      return;
    }

    // Send notification to a user
    if (notifForUser.includes(data.type)) {
      const userSocket = userSockets[data.to];

      // Verify if data are valid
      if (!data.to) {
        socket.emit("error", error);
        return;
      }

      io.to(userSocket.socket).emit("notification", { type: data.type });
    } else if (notifForChannel.includes(data.type)) {
      const userSocket = userSockets[socket.data.userId];

      if (userSocket.room) {
        io.to(userSocket.room).emit("notification", { type: data.type });
      }
    }
  });
};

function leaveAllRooms(socket: Socket) {
  socket.rooms.forEach((idRoom) => {
    if (idRoom === socket.id) return;
    socket.leave(idRoom);
  });
}
