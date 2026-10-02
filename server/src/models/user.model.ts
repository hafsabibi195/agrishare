import { Schema, model, type Model } from "mongoose";

export interface UserRecord {
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
  role: "farmer" | "owner" | "admin";
  twoFactorEnabled: boolean;
  twoFactorSecret?: string;
  backupCodeHashes: string[];
  refreshTokenHash?: string;
  isSuspended: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<UserRecord>(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    phone: { type: String, required: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ["farmer", "owner", "admin"], required: true, default: "farmer" },
    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorSecret: { type: String, select: false },
    backupCodeHashes: { type: [String], select: false, default: [] },
    refreshTokenHash: { type: String, select: false },
    isSuspended: { type: Boolean, default: false }
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_document, result) => {
        const sanitized = result as unknown as Record<string, unknown>;
        delete sanitized.passwordHash;
        delete sanitized.twoFactorSecret;
        delete sanitized.backupCodeHashes;
        delete sanitized.refreshTokenHash;
        delete sanitized.__v;
        return sanitized;
      }
    }
  }
);

export const User: Model<UserRecord> = model<UserRecord>("User", userSchema);