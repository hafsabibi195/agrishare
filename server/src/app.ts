import cors from "cors";
import cookieParser from "cookie-parser";
import express from "express";
import mongoSanitize from "express-mongo-sanitize";
import helmet from "helmet";
import { errorHandler } from "./middleware/error.middleware.js";
import { authRouter } from "./routes/auth.routes.js";
import { healthRouter } from "./routes/health.routes.js";

export const app = express();

app.disable("x-powered-by");
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_ORIGIN ?? "http://localhost:3000", credentials: true }));
app.use(cookieParser());
app.use(express.json({ limit: "1mb" }));
app.use(mongoSanitize());
app.use("/api", healthRouter);
app.use("/api/auth", authRouter);
app.use(errorHandler);