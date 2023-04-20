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

export async function listenDatabaseFriendRequests(pb: any, event: any) {
  if (event.action === "create") {
    const userId = event.record.to;

    // Retrieve the user socket
    const user = userSockets[userId];

    // Send the notification
    if (user) {
      io.to(user.socket).emit("notification", { name: "new-friend-request" });
    }
  }
}
