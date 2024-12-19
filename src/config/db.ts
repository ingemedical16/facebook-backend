import mongoose, { ConnectOptions } from "mongoose";

export const connectToDatabase = async (): Promise<void> => {
  const uri = process.env.DATABASE_URL as string;
  const clientOptions: ConnectOptions = {
    serverApi: {
      version: "1",
      strict: true,
      deprecationErrors: true,
    },
  };

  try {
    await mongoose.connect(uri, clientOptions);
    console.log("Connected to MongoDB Successfully");
  } catch (err: any) {
    console.error("Error connecting to MongoDB:", err.message);
  }
};
