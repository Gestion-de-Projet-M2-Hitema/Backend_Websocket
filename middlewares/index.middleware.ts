import { Socket } from "socket.io";

// Import Middlewares
import general from "./general.middleware";
import channels from "./channels.middleware";

export default (socket: Socket) => {
  general(socket);
  channels(socket);
};
