import { Server, Socket } from "socket.io";

interface EmitSocketEventOptions {
  io: Server;
  socket?: Socket;
  event: string;
  roomId?: string;
  data: any;
}

/**
 * Emits a socket event to a specific room, socket, or broadcast to all clients.
 *
 * @param options - Configuration object for emitting a socket event
 * @param options.io - The Socket.io server instance
 * @param options.socket - The specific socket instance (optional)
 * @param options.event - The event name to emit
 * @param options.roomId - The room to emit the event to (optional)
 * @param options.data - The data to send with the event
 */
export const emitSocketEvent = ({
  io,
  socket,
  event,
  roomId,
  data,
}: EmitSocketEventOptions) => {
  if (roomId) {
    // Emit to a specific room
    io.to(roomId).emit(event, data);
  } else if (socket) {
    // Emit to a specific socket
    socket.emit(event, data);
  } else {
    // Emit to all connected clients
    io.emit(event, data);
  }
};
