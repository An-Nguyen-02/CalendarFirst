import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

export async function getGoogle(req: Request, res: Response) {
  const userId = req.user?.sub;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const conn = await prisma.calendarConnection.findUnique({
    where: { userId_provider: { userId, provider: "GOOGLE" } },
  });
  if (!conn) {
    res.status(200).json({ connected: false });
    return;
  }
  res.status(200).json({
    connected: true,
    email: conn.email ?? undefined,
    scopes: conn.scopes ? conn.scopes.split(",") : undefined,
  });
}
