import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";
import type { LoginInput, RegisterInput } from "../schemas/auth";

const JWT_SECRET = process.env.JWT_SECRET ?? "fallback-secret";
const ACCESS_EXPIRY = process.env.JWT_ACCESS_EXPIRY ?? "15m";
const REFRESH_EXPIRY = process.env.JWT_REFRESH_EXPIRY ?? "7d";

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function login(input: LoginInput) {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
  });
  if (!user) return null;

  const ok = await bcrypt.compare(input.password, user.passwordHash);
  if (!ok) return null;

  const accessToken = jwt.sign(
    { sub: user.id, email: user.email, role: user.role },
    JWT_SECRET as jwt.Secret,
    { expiresIn: ACCESS_EXPIRY } as jwt.SignOptions
  );

  const refreshToken = crypto.randomUUID();
  const refreshExpiry = new Date();
  refreshExpiry.setDate(refreshExpiry.getDate() + 7); // 7 days

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(refreshToken),
      expiresAt: refreshExpiry,
    },
  });

  return {
    accessToken,
    refreshToken,
    expiresIn: ACCESS_EXPIRY,
    user: { id: user.id, email: user.email, role: user.role },
  };
}

export async function register(input: RegisterInput) {
  const existing = await prisma.user.findUnique({
    where: { email: input.email },
  });
  if (existing) return null;

  const passwordHash = await bcrypt.hash(input.password, 10);
  const user = await prisma.user.create({
    data: {
      email: input.email,
      passwordHash,
      role: input.role,
    },
  });

  const accessToken = jwt.sign(
    { sub: user.id, email: user.email, role: user.role },
    JWT_SECRET as jwt.Secret,
    { expiresIn: ACCESS_EXPIRY } as jwt.SignOptions
  );

  const refreshToken = crypto.randomUUID();
  const refreshExpiry = new Date();
  refreshExpiry.setDate(refreshExpiry.getDate() + 7);

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(refreshToken),
      expiresAt: refreshExpiry,
    },
  });

  return {
    accessToken,
    refreshToken,
    expiresIn: ACCESS_EXPIRY,
    user: { id: user.id, email: user.email, role: user.role },
  };
}

export async function refresh(refreshToken: string) {
  const tokenHash = hashToken(refreshToken);
  const record = await prisma.refreshToken.findFirst({
    where: { tokenHash, revokedAt: null },
    include: { user: true },
  });

  if (!record || record.expiresAt < new Date()) return null;

  await prisma.refreshToken.delete({
    where: { id: record.id },
  });

  const newRefreshToken = crypto.randomUUID();
  const newRefreshExpiry = new Date();
  newRefreshExpiry.setDate(newRefreshExpiry.getDate() + 7);

  await prisma.refreshToken.create({
    data: {
      userId: record.userId,
      tokenHash: hashToken(newRefreshToken),
      expiresAt: newRefreshExpiry,
    },
  });

  const accessToken = jwt.sign(
    { sub: record.user.id, email: record.user.email, role: record.user.role },
    JWT_SECRET as jwt.Secret,
    { expiresIn: ACCESS_EXPIRY } as jwt.SignOptions
  );

  return {
    accessToken,
    refreshToken: newRefreshToken,
    expiresIn: ACCESS_EXPIRY,
    user: { id: record.user.id, email: record.user.email, role: record.user.role },
  };
}

export async function logout(refreshToken: string) {
  const tokenHash = hashToken(refreshToken);
  await prisma.refreshToken.updateMany({
    where: { tokenHash },
    data: { revokedAt: new Date() },
  });
}

export async function getUserById(userId: string) {
  return await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, role: true },
  });
}
