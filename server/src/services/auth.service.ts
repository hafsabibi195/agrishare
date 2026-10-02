import bcrypt from "bcrypt";
import { randomBytes } from "node:crypto";
import jwt from "jsonwebtoken";
import speakeasy from "speakeasy";
import type { HydratedDocument } from "mongoose";
import { User, type UserRecord } from "../models/user.model.js";
import { AppError } from "../lib/app-error.js";
import { hashToken, signSessionTokens, signTwoFactorChallenge, verifyToken } from "../lib/tokens.js";

const BCRYPT_ROUNDS = 12;

export async function registerUser(input: { name: string; email: string; phone: string; password: string; role: "farmer" | "owner" }) {
  return User.create({
    name: input.name,
    email: input.email.toLowerCase(),
    phone: input.phone,
    role: input.role,
    passwordHash: await bcrypt.hash(input.password, BCRYPT_ROUNDS)
  });
}

export async function authenticateUser(email: string, password: string) {
  const user = await User.findOne({ email: email.toLowerCase() }).select("+passwordHash +twoFactorSecret +backupCodeHashes");
  const passwordMatches = user ? await bcrypt.compare(password, user.passwordHash) : false;
  if (!user || !passwordMatches || user.isSuspended) throw new AppError(401, "Invalid email or password");
  if (user.role === "admin") throw new AppError(403, "Please use the admin portal");
  if (user.twoFactorEnabled) {
    return { twoFactorRequired: true as const, challengeToken: signTwoFactorChallenge(user._id.toString()) };
  }
  return { twoFactorRequired: false as const, user };
}

export async function verifyLoginCode(challengeToken: string, code: string) {
  const payload = verifyToken(challengeToken, "two-factor");
  const user = await User.findById(payload.sub).select("+twoFactorSecret +backupCodeHashes");
  if (!user || !user.twoFactorEnabled || !user.twoFactorSecret || user.isSuspended) {
    throw new AppError(401, "Invalid or expired verification request");
  }
  let verified = /^\d{6}$/.test(code) && speakeasy.totp.verify({
    secret: user.twoFactorSecret, encoding: "base32", token: code, window: 1
  });
  if (!verified) {
    const index = await findBackupCode(user.backupCodeHashes, code.toLowerCase());
    if (index >= 0) {
      user.backupCodeHashes.splice(index, 1);
      await user.save();
      verified = true;
    }
  }
  if (!verified) throw new AppError(401, "Invalid verification code");
  return user;
}

async function findBackupCode(hashes: string[], code: string): Promise<number> {
  for (let index = 0; index < hashes.length; index += 1) {
    if (await bcrypt.compare(code, hashes[index])) return index;
  }
  return -1;
}

export async function createTwoFactorSetup(userId: string) {
  const user = await User.findById(userId).select("+twoFactorSecret");
  if (!user) throw new AppError(404, "User not found");
  if (user.twoFactorEnabled) throw new AppError(409, "Two-factor authentication is already enabled");
  const secret = speakeasy.generateSecret({ name: `AgriShare (${user.email})`, issuer: "AgriShare" });
  user.twoFactorSecret = secret.base32;
  await user.save();
  return secret.otpauth_url;
}

export async function enableTwoFactor(userId: string, code: string) {
  const user = await User.findById(userId).select("+twoFactorSecret +backupCodeHashes");
  if (!user?.twoFactorSecret) throw new AppError(400, "Start two-factor setup before verifying a code");
  if (user.twoFactorEnabled) throw new AppError(409, "Two-factor authentication is already enabled");
  const verified = speakeasy.totp.verify({ secret: user.twoFactorSecret, encoding: "base32", token: code, window: 1 });
  if (!verified) throw new AppError(401, "Invalid verification code");
  const backupCodes = Array.from({ length: 8 }, () => randomBytes(5).toString("hex").toUpperCase());
  user.backupCodeHashes = await Promise.all(backupCodes.map((value) => bcrypt.hash(value.toLowerCase(), BCRYPT_ROUNDS)));
  user.twoFactorEnabled = true;
  await user.save();
  return backupCodes;
}

export async function createSession(user: HydratedDocument<UserRecord>) {
  const tokens = signSessionTokens(user);
  user.refreshTokenHash = hashToken(tokens.refreshToken);
  await user.save();
  return tokens;
}

export async function rotateSession(refreshToken: string) {
  const payload = verifyToken(refreshToken, "refresh");
  const user = await User.findById(payload.sub).select("+refreshTokenHash");
  if (!user?.refreshTokenHash || user.refreshTokenHash !== hashToken(refreshToken) || user.isSuspended) {
    throw new AppError(401, "Invalid or expired refresh token");
  }
  const tokens = signSessionTokens(user);
  user.refreshTokenHash = hashToken(tokens.refreshToken);
  await user.save();
  return { user, ...tokens };
}

export async function revokeSession(refreshToken: string | undefined): Promise<void> {
  if (!refreshToken) return;
  const payload = jwt.decode(refreshToken);
  if (typeof payload !== "object" || !payload?.sub) return;
  const user = await User.findById(payload.sub).select("+refreshTokenHash");
  if (user?.refreshTokenHash === hashToken(refreshToken)) {
    user.refreshTokenHash = undefined;
    await user.save();
  }
}