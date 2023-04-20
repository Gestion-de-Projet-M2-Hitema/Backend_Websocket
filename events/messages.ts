import pb from "../db";
import { Server, Socket } from "socket.io";

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
    const form = new FormData();

    form.append("user", socket.data.userId);
    form.append("channel", socket.data.channelId);
    if (data.content) {
      form.append("content", data.content);
    }
    if (data.image) {
      form.append("image", new Blob([data.image]), "image.png");
    }

    console.log(form);

    const message = await pb.collection("messages").create(form);
    const newMessage = {
      id: message.id,
      content: message.content,
      image: message.image ? pb.files.getUrl(message, message.image) : null,
      user: socket.data.user,
      date: message.created,
    };

    io.to(socket.data.channelId).emit("new-message", newMessage);
  } catch (err) {
    socket.emit("error", error);
    return;
  }
}
