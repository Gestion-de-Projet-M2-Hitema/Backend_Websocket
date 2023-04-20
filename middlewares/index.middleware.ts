import { Socket } from "socket.io";

// Import Middlewares
import general from "./general.middleware";

export default (socket: Socket) => {
  general(socket);
};
