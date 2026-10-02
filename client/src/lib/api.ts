export type User = {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: "farmer" | "owner" | "admin";
  twoFactorEnabled: boolean;
};

export type ApiEnvelope<T> = { success: boolean; data: T };

export const API_URL = "frontend-only";

export async function apiRequest<T>(_path: string, _init: RequestInit = {}): Promise<T> {
  throw new Error("This app is running without a backend API.");
}