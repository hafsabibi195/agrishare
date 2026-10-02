import type { Request, RequestHandler } from "express";
import { User } from "../models/user.model.js";
import { AppError } from "../lib/app-error.js";
import { verifyToken } from "../lib/tokens.js";

declare global {
  namespace Express {
    interface Request {
      authUser?: { id: string; role: "farmer" | "owner" | "admin" };
    }
  }
}

export function getAccessToken(request: Request): string | undefined {
  const cookieToken = request.cookies?.access_token;
  if (typeof cookieToken === "string") return cookieToken;
  const authorization = request.header("authorization");
  return authorization?.startsWith("Bearer ") ? authorization.slice(7) : undefined;
}

export const requireAuth: RequestHandler = async (request, _response, next) => {
  try {
    const token = getAccessToken(request);
    if (!token) throw new AppError(401, "Authentication required");
    const payload = verifyToken(token, "access");
    const user = await User.findById(payload.sub).select("role isSuspended");
    if (!user || user.isSuspended) throw new AppError(401, "Account is unavailable");
    request.authUser = { id: user._id.toString(), role: user.role };
    next();
  } catch (error) {
    next(error);
  }
};

export function requireRole(...roles: Array<"farmer" | "owner">): RequestHandler {
  return (request, _response, next) => {
    if (!request.authUser || !roles.includes(request.authUser.role as "farmer" | "owner")) {
      next(new AppError(403, "You do not have permission to access this resource"));
      return;
    }
    next();
  };
}