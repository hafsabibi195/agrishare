import { createHash, randomBytes } from "node:crypto";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { AppError } from "./app-error.js";

const ACCESS_TTL = "15m";
const REFRESH_TTL = "7d";
const DEV_FALLBACK_JWT_SECRET = "dev-agrishare-jwt-secret-for-local-use-only-123456";

function jwtSecret(): string {
  const configuredSecret = process.env.JWT_SECRET;

  if (configuredSecret && configuredSecret.length >= 32) {
    return configuredSecret;
  }

  if (process.env.NODE_ENV !== "production") {
    console.warn("JWT_SECRET not configured or too short; using a local development fallback. Set a secure value in .env before deployment.");
    return DEV_FALLBACK_JWT_SECRET;
  }

  throw new AppError(500, "JWT_SECRET must be configured with at least 32 characters");
}

export function assertJwtConfigured(): void {
  jwtSecret();
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function signSessionTokens(user: { _id: { toString(): string }; role: string }) {
  const claims = { sub: user._id.toString(), role: user.role };
  const accessToken = jwt.sign({ ...claims, tokenUse: "access" }, jwtSecret(), { expiresIn: ACCESS_TTL });
  const refreshToken = jwt.sign(
    { ...claims, tokenUse: "refresh", nonce: randomBytes(16).toString("hex") },
    jwtSecret(),
    { expiresIn: REFRESH_TTL }
  );
  return { accessToken, refreshToken };
}

export function signTwoFactorChallenge(userId: string): string {
  return jwt.sign({ sub: userId, tokenUse: "two-factor" }, jwtSecret(), { expiresIn: "5m" });
}

export function verifyToken(token: string, expectedUse: string): JwtPayload {
  try {
    const payload = jwt.verify(token, jwtSecret());
    if (typeof payload === "string" || payload.tokenUse !== expectedUse || typeof payload.sub !== "string") {
      throw new AppError(401, "Invalid or expired token");
    }
    return payload;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(401, "Invalid or expired token");
  }
}