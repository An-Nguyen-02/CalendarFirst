import { Request, Response } from "express";
import { loginSchema, refreshSchema, registerSchema } from "../schemas/auth";
import * as authService from "../services/authService";

export async function register(req: Request, res: Response) {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const result = await authService.register(parsed.data);
  if (!result) {
    res.status(409).json({ error: "Email already registered" });
    return;
  }

  res.status(201).json(result);
}

export async function login(req: Request, res: Response) {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const result = await authService.login(parsed.data);
  if (!result) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  res.status(200).json(result);
}

export async function refresh(req: Request, res: Response) {
  const parsed = refreshSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const result = await authService.refresh(parsed.data.refreshToken);
  if (!result) {
    res.status(401).json({ error: "Invalid or expired refresh token" });
    return;
  }

  res.status(200).json(result);
}

export async function logout(req: Request, res: Response) {
  const parsed = refreshSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  await authService.logout(parsed.data.refreshToken);
  res.status(200).json({ success: true });
}

export async function me(req: Request, res: Response) {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const user = await authService.getUserById(req.user.sub);
  if (!user) {
    res.status(401).json({ error: "User not found" });
    return;
  }
  res.status(200).json({ id: user.id, email: user.email, role: user.role });
}
