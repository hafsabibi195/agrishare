import mongoose from "mongoose";

export async function connectDatabase(uri: string | undefined): Promise<void> {
  if (!uri) {
    console.warn("MONGODB_URI is not set; starting API without a database connection.");
    return;
  }

  await mongoose.connect(uri);
  console.info("Connected to MongoDB.");
}