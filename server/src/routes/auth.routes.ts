import { Router } from "express";
import rateLimit from "express-rate-limit";
import { requireAuth } from "../middleware/auth.middleware.js";
import { confirmTwoFactor, currentUser, login, logout, refresh, register, setupTwoFactor, verifyLoginTwoFactor } from "../controllers/auth.controller.js";

const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: true, legacyHeaders: false });
const twoFactorLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: true, legacyHeaders: false });

export const authRouter = Router();
authRouter.post("/register", loginLimiter, register);
authRouter.post("/login", loginLimiter, login);
authRouter.post("/2fa/verify-login", twoFactorLimiter, verifyLoginTwoFactor);
authRouter.post("/refresh", refresh);
authRouter.post("/logout", logout);
authRouter.get("/me", requireAuth, currentUser);
authRouter.post("/2fa/setup", requireAuth, twoFactorLimiter, setupTwoFactor);
authRouter.post("/2fa/confirm", requireAuth, twoFactorLimiter, confirmTwoFactor);