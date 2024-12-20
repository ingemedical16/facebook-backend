import { CorsOptions } from "cors";

const corsOptions: CorsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    const allowedOrigins = (process.env.FRONTEND_URLs || "http://localhost:3000")
      .split(",") 
      .map((url) => url.trim()); 

    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true); 
    } else {
      callback(new Error("Not allowed by CORS")); 
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], 
  credentials: true, 
  optionsSuccessStatus: 200 
};

export default corsOptions;
