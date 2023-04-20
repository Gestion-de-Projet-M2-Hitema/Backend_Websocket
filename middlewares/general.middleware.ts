import { Socket } from "socket.io";
import { buildSocketError } from "../utils/errors.utils";
import jwt, { JwtPayload } from "jsonwebtoken";
import pb from "../db";
import { User } from "../utils/types.utils";
import * as dotenv from "dotenv";

dotenv.config();

export default (socket: Socket) => {
  socket.use(async ([event, ...args], next) => {
    // We add the name of the triggering event in the socket request
    socket.data.eventTriggered = event;

    const tokenError = buildSocketError("invalid-token", event);
    const data = args[0];

    if (typeof data != "object") {
      next(tokenError);
    }

    const token = data.token;

    // Verify if the token has been defined
    if (token) {
      const privateKey = process.env.JWT_PRIVATE_KEY;

      if (!privateKey) {
        next(tokenError);
        return;
      }

      try {
        const decoded: JwtPayload & { id: string } = jwt.verify(
          token,
          privateKey
        ) as JwtPayload & { id: string };

        const user: User = await pb.collection("users").getOne(decoded.id);
        const avatar = user.avatar ? pb.files.getUrl(user, user.avatar) : null;

        socket.data.userId = user.id;
        socket.data.user = {
          id: user.id,
          username: user.username,
          avatar: avatar,
        };

        next();
      } catch (err) {
        next(tokenError);
      }
    } else {
      next(tokenError);
    }
  });
};
