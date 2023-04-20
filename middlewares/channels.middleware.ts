import { Socket } from "socket.io";
import { buildSocketError } from "../utils/errors.utils";
import pb from "../db";

export default (socket: Socket) => {
  socket.use(async ([event, ...args], next) => {
    if (event !== "join-channel") {
      next();
      return;
    }

    const errorInvalidData = buildSocketError("invalid-data", event);
    const data = args[0];

    // Verify if the id channel has been defined
    if (!data.id) {
      next(errorInvalidData);
      return;
    }

    const errorChannelExists = buildSocketError("channel-not-existing", event);

    try {
      // Verify if the user is a member of the channel's server
      const channel = await pb.collection("channels").getOne(data.id);
      const errorServerExists = buildSocketError("server-not-existing", event);

      try {
        const server = await pb.collection("servers").getOne(channel.server);
        const errorNotMember = buildSocketError("user-not-member", event);

        if (server.members.includes(socket.data.userId)) {
          socket.data.channelId = channel.id;
          socket.data.serverId = server.id;

          next();
        } else {
          next(errorNotMember);
        }
      } catch (err) {
        next(errorServerExists);
      }
    } catch (err) {
      next(errorChannelExists);
    }
  });
};
