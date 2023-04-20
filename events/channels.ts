import pb from "../db";
import { Server, Socket } from "socket.io";
import { leaveAllRooms } from ".";
import { userChannels } from "../app";
import { Message, User } from "../utils/types.utils";

export async function joinChannel(
  io: Server,
  socket: Socket,
  data: Record<string, string>
) {
  const error = {
    error: "invalid-data",
    event: socket.data.eventTriggered,
  };

  // Verify if data are valid
  if (!data.id) {
    socket.emit("error", error);
    return;
  }

  const idChannel = data.id;

  // The user leaves all the rooms which he's connected
  leaveAllRooms(socket);

  // Connect to the room
  socket.join(idChannel);
  userChannels[socket.data.userId] = idChannel;

  // Retrieve all the users
  const allUsers = await pb.collection("users").getFullList();
  const users: User[] = allUsers.map((user: User) => {
    const avatar = user.avatar ? pb.files.getUrl(user, user.avatar) : null;
    return {
      id: user.id,
      username: user.username,
      avatar: avatar,
    };
  });

  // Retrieve all the messages
  const messages = await pb.collection("messages").getFullList({
    filter: `channel="${idChannel}"`,
  });

  const result: Record<string, any>[] = [];

  // Browse messages and format
  messages.forEach((message: Message) => {
    const image = message.image
      ? pb.files.getUrl(message, message.image)
      : null;

    const user: User | undefined = users.find(
      (user) => user.id == socket.data.userId
    );

    const dataMessage = {
      id: message.id,
      content: message.content,
      image: image,
      user: user ? user : null,
      date: message.created,
    };

    result.push(dataMessage);
  });

  socket.emit("join-channel", result);
}

export function leaveChannel(
  io: Server,
  socket: Socket,
  data: Record<string, string>
) {
  leaveAllRooms(socket);
}
