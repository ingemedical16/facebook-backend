import express, { Application, Request, Response } from "express";
import cors from "cors";
import { readdirSync } from "fs";
import { connectToDatabase } from "./config/db";
import path from "path";
import dotenv from "dotenv";
import homeRouter from "./home";
dotenv.config();

const app: Application = express();

app.use(express.static(path.join(__dirname, "src", "public")));
app.use(express.json());
const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:3000", // Your frontend origin
  credentials: true, // Allow credentials (cookies, etc.)
  optionsSuccessStatus: 200, // Status for preflight responses
};
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
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
