import { Request, Response, NextFunction } from "express";
import { Server as SocketIOServer } from "socket.io";

// Extend the Express Request interface to include the `io` property
declare global {
  namespace Express {
    interface Request {
      io?: SocketIOServer;
    }
  }
}

// Middleware to attach Socket.io to the request object
const socketMiddleware = (io: SocketIOServer) => {
  return (req: Request, res: Response, next: NextFunction) => {
    req.io = io; // Attach the Socket.io instance to the request object
    next();
  };
};

export default socketMiddleware;
