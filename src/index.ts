import express, { Application, Request, Response  } from "express";
import { Server as SocketIOServer } from "socket.io";
import cors from "cors";
import { readdirSync } from "fs";
import { connectToDatabase } from "./config/db";
import path from "path";
import dotenv from "dotenv";
import homeRouter from "./home";
import { corsOptions } from "./helpers";
import socketMiddleware from "./middlewares/socketMiddleware";
dotenv.config();
export const userSockets = new Map<string, string>(); // Maps userId -> socketId
const app: Application = express();
// Initialize Socket.io server
const http = require('http').createServer(app);
const io = new SocketIOServer(http, {
  cors: {
    origin: corsOptions.origin as any, // Pass origin handler from corsOptions
    methods: corsOptions.methods,
    credentials: corsOptions.credentials,
  },
});



// Middleware to attach socket to the request object
app.use(socketMiddleware(io)); 




app.use(express.static(path.join(__dirname, "src", "public")));
app.use(express.json())
app.use(cors(corsOptions));
app.use("/", homeRouter);

const loadRoutes = async () => {
  const routeFiles = readdirSync(path.join(__dirname, "routes")).filter(
    (file) => file.endsWith(".ts")
  ); // Only load .ts files
  if (!routeFiles.length) {
    console.error("No routes found in the routes directory.");
    process.exit(1);
  }
  await Promise.all(
    routeFiles.map(async (file) => {
      const routePath = `/api/${file.split(".")[0]}`;

      const route = await import(`./routes/${file}`);
      app.use(routePath, route.default || route);
    })
  );
};

loadRoutes().catch((error: Error) => {
  console.error("Error loading routes:", error.message);
});

// Connect to the database
connectToDatabase();

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 8000;
// Listen for connections to the server
http.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Socket.io event handlers
io.on("connection", (socket) => {
  console.log("✅ A user connected:", socket.id);

  // Listen for a custom "register" event to map userId -> socketId
  socket.on("register", (userId) => {
    userSockets.set(userId, socket.id);
    console.log(`✅ User ${userId} registered with socket ${socket.id}`);
  });

  // Remove user from map when they disconnect
  socket.on("disconnect", () => {
    console.log(`❌ User disconnected: ${socket.id}`);
    for (const [userId, socketId] of userSockets.entries()) {
      if (socketId === socket.id) {
        userSockets.delete(userId);
        break;
      }
    }
  });
});