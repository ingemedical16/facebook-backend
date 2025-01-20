import { CorsOptions } from "cors";


const corsOptions: CorsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    const allowedOrigins = (process.env.FRONTEND_URLS || "http://localhost:3000")
      .split(",")
      .map((url) => url.trim());
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true); // Allow request
    } else {
      console.error(`Blocked by CORS: ${origin}`); // Log unauthorized origins
      callback(new Error("Not allowed by CORS")); // Reject request
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Supported HTTP methods
  credentials: true, // Allow cookies and credentials
  optionsSuccessStatus: 204, // Use 204 for OPTIONS responses
};

export default corsOptions;
