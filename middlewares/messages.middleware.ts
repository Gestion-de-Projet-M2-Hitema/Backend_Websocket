import { Socket } from "socket.io";
import { buildSocketError } from "../utils/errors.utils";
import pb from "../db";
import { userChannels } from "../app";

export default (socket: Socket) => {
  socket.use(async ([event, ...args], next) => {
    if (event !== "send-message") {
      next();
      return;
    }

    const errorInvalidData = buildSocketError("invalid-data", event);
    const data = args[0];

    // Verify if the id channel has been defined
    if (!data.content && !data.image) {
      next(errorInvalidData);
      return;
    }

    const errorNotInChannel = buildSocketError(
      "user-not-inside-channel",
      event
    );

    // Verifiy if user has joined a channel
    if (!userChannels[socket.data.userId]) {
      next(errorNotInChannel);
    } else {
      // Verify if the channel exists
      const errorChannelExists = buildSocketError(
        "channel-not-existing",
        event
      );

      try {
        const channel = await pb
          .collection("channels")
          .getOne(userChannels[socket.data.userId]);

        if (channel) {
          next();
        } else {
          next(errorChannelExists);
        }
      } catch (err) {
        next(errorChannelExists);
      }
    }
  });
};
