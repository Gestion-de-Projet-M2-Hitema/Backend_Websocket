export interface ClientToServerEvents {
  initialize: (data: Object) => void;
  notification: (data: Object) => void;
  "new-message": (data: object) => void;
}
export interface ServerToClientEvents {
  error: (data: object) => void;
  notification: (data: Object) => void;
}
export interface InterServerEvents {}
export interface SocketData {
  eventTriggered: string | undefined;
  userId: string | undefined;
}

export interface UserSocket {
  socket: string;
  room: string | undefined;
}
