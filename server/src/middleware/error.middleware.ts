import type { ErrorRequestHandler } from "express";
import { AppError } from "../lib/app-error.js";

export const errorHandler: ErrorRequestHandler = (error: unknown, _request, response, _next) => {
  if (error instanceof AppError) {
    response.status(error.statusCode).json({ success: false, error: { message: error.message, details: error.details } });
    return;
  }
  if (typeof error === "object" && error !== null && "code" in error && error.code === 11000) {
    response.status(409).json({ success: false, error: { message: "An account with this email already exists" } });
    return;
  }
  console.error("Unhandled API error:", error);
  response.status(500).json({ success: false, error: { message: "Internal server error" } });
};