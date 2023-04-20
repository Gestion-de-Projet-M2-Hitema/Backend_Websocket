export interface ClientToServerEvents {
  initialize: (data: Object) => void;
  notification: (data: Object) => void;
  "join-channel": (data: object) => void;
  "leave-channel": (data: object) => void;
}
export interface ServerToClientEvents {
  error: (data: object) => void;
  notification: (data: Object) => void;
  "join-channel": (data: object) => void;
}
export interface InterServerEvents {}
export interface SocketData {
  eventTriggered: string | undefined;
  userId: string | undefined;
  channelId: string | undefined;
  serverId: string | undefined;
}

export interface UserSocket {
  socket: string;
  room: string | undefined;
}
