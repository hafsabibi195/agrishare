import path from "node:path";
import dotenv from "dotenv";
import { connectDatabase } from "./config/database.js";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const port = Number(process.env.PORT ?? 4000);

async function startServer(): Promise<void> {
  await connectDatabase(process.env.MONGODB_URI);
  const { app } = await import("./app.js");

  app.listen(port, () => {
    console.info(`AgriShare API listening on http://localhost:${port}`);
  });
}

startServer().catch((error: unknown) => {
  console.error("Failed to start AgriShare API:", error);
  process.exitCode = 1;
});