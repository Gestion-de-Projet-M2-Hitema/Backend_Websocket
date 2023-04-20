import pb from "../db";
import { Server, Socket } from "socket.io";
import { Message, User } from "../utils/types.utils";
import { buildSocketError } from "../utils/errors.utils";

export async function sendMessage(
  io: Server,
  socket: Socket,
  data: Record<string, string>
) {
  const error = {
    error: "invalid-data",
    event: socket.data.eventTriggered,
  };

  try {
    // Create the message
    const messageData = {
      user: socket.data.userId,
      channel: socket.data.channelId,
      content: data.content || undefined,
      image: data.image || undefined,
    };

    const message = await pb.collection("messages").create(messageData);
    const newMessage = {
      id: message.id,
      content: message.content,
      image: null,
      user: socket.data.user,
      date: message.created,
    };

    socket.emit("new-message", newMessage);
  } catch (err) {
    socket.emit("error", error);
    return;
  }
}
