import type { CookieOptions, RequestHandler } from "express";
import qrcode from "qrcode";
import { asyncHandler } from "../lib/async-handler.js";
import { AppError } from "../lib/app-error.js";
import { assertJwtConfigured } from "../lib/tokens.js";
import { parseBody } from "../lib/validation.js";
import { User } from "../models/user.model.js";
import { codeSchema, loginSchema, registerSchema } from "../validation/auth.schemas.js";
import { authenticateUser, createSession, createTwoFactorSetup, enableTwoFactor, registerUser, revokeSession, rotateSession, verifyLoginCode } from "../services/auth.service.js";

const cookieBase: CookieOptions = { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" };
const accessCookie: CookieOptions = { ...cookieBase, path: "/api", maxAge: 15 * 60 * 1000 };
const refreshCookie: CookieOptions = { ...cookieBase, path: "/api/auth", maxAge: 7 * 24 * 60 * 60 * 1000 };
const challengeCookie: CookieOptions = { ...cookieBase, path: "/api/auth/2fa", maxAge: 5 * 60 * 1000 };

function setSessionCookies(response: Parameters<RequestHandler>[1], accessToken: string, refreshToken: string): void {
  response.cookie("access_token", accessToken, accessCookie);
  response.cookie("refresh_token", refreshToken, refreshCookie);
}

function clearSessionCookies(response: Parameters<RequestHandler>[1]): void {
  response.clearCookie("access_token", { ...accessCookie, maxAge: undefined });
  response.clearCookie("refresh_token", { ...refreshCookie, maxAge: undefined });
}

export const register: RequestHandler = asyncHandler(async (request, response) => {
  assertJwtConfigured();
  const user = await registerUser(parseBody(registerSchema, request.body));
  const tokens = await createSession(user);
  setSessionCookies(response, tokens.accessToken, tokens.refreshToken);
  response.status(201).json({ success: true, data: { user } });
});

export const login: RequestHandler = asyncHandler(async (request, response) => {
  assertJwtConfigured();
  const input = parseBody(loginSchema, request.body);
  const result = await authenticateUser(input.email, input.password);
  if (result.twoFactorRequired) {
    await revokeSession(request.cookies?.refresh_token);
    clearSessionCookies(response);
    response.cookie("two_factor_token", result.challengeToken, challengeCookie);
    response.json({ success: true, data: { requiresTwoFactor: true } });
    return;
  }
  const tokens = await createSession(result.user);
  setSessionCookies(response, tokens.accessToken, tokens.refreshToken);
  response.json({ success: true, data: { user: result.user } });
});

export const verifyLoginTwoFactor: RequestHandler = asyncHandler(async (request, response) => {
  const { code } = parseBody(codeSchema, request.body);
  const challengeToken = request.cookies?.two_factor_token;
  if (typeof challengeToken !== "string") throw new AppError(401, "Two-factor verification required");
  const user = await verifyLoginCode(challengeToken, code);
  const tokens = await createSession(user);
  response.clearCookie("two_factor_token", { ...challengeCookie, maxAge: undefined });
  setSessionCookies(response, tokens.accessToken, tokens.refreshToken);
  response.json({ success: true, data: { user } });
});

export const refresh: RequestHandler = asyncHandler(async (request, response) => {
  const token = request.cookies?.refresh_token;
  if (typeof token !== "string") throw new AppError(401, "Refresh token required");
  const result = await rotateSession(token);
  setSessionCookies(response, result.accessToken, result.refreshToken);
  response.json({ success: true, data: { user: result.user } });
});

export const logout: RequestHandler = asyncHandler(async (request, response) => {
  await revokeSession(request.cookies?.refresh_token);
  clearSessionCookies(response);
  response.clearCookie("two_factor_token", { ...challengeCookie, maxAge: undefined });
  response.json({ success: true, data: { message: "Logged out" } });
});

export const currentUser: RequestHandler = asyncHandler(async (request, response) => {
  const user = await User.findById(request.authUser?.id);
  if (!user) throw new AppError(404, "User not found");
  response.json({ success: true, data: { user } });
});

export const setupTwoFactor: RequestHandler = asyncHandler(async (request, response) => {
  const otpauthUrl = await createTwoFactorSetup(request.authUser!.id);
  if (!otpauthUrl) throw new AppError(500, "Unable to generate authenticator setup");
  response.json({ success: true, data: { qrCodeDataUrl: await qrcode.toDataURL(otpauthUrl), otpauthUrl } });
});

export const confirmTwoFactor: RequestHandler = asyncHandler(async (request, response) => {
  const { code } = parseBody(codeSchema, request.body);
  const backupCodes = await enableTwoFactor(request.authUser!.id, code);
  response.json({ success: true, data: { enabled: true, backupCodes } });
});