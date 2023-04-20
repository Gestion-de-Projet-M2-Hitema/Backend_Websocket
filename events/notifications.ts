import { Socket } from "socket.io";
import { io, userSockets, userChannels } from "../app";

export async function listenDatabaseMessages(pb: any, event: any) {
  if (event.action === "create") {
    const userId = event.record.user;
    const channelId = event.record.channel;

    try {
      // Retrieve the server
      const channel = await pb.collection("channels").getOne(channelId);
      const server = await pb.collection("servers").getOne(channel.server);

      // Retrieve the user sockets where to send the notification
      const members: string[] = server.members.filter(
        (memberId: string) => memberId !== userId
      );
      const membersToSend: string[] = members.filter(
        (memberId: string) =>
          (!userChannels[memberId] || userChannels[memberId] !== channelId) &&
          userSockets[memberId]
      );
      const memberSockets: string[] = membersToSend.map(
        (memberId: string) => userSockets[memberId].socket
      );

      // Send the notification
      if (memberSockets.length > 0) {
        io.to(memberSockets).emit("notification", { name: "new-message" });
      }
    } catch (err: any) {}
  }
}

export function sendNotification(socket: Socket, data: Record<string, string>) {
  /*
      Data Format :
      data: {
        type: "friend" | "join-server" | "message",
        to?: idUser | idChannel,
      }
    */
  const notifTypes: string[] = ["friend"];
  const notifForUser: string[] = ["friend"];
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
}
