import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET ?? "fallback-secret";

export interface JwtPayload {
  sub: string;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  const token = auth?.startsWith("Bearer ") ? auth.slice(7) : undefined;

  if (!token) {
    res.status(401).json({ error: "Missing or invalid authorization" });
    return;
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as JwtPayload;
    req.user = { sub: payload.sub, email: payload.email };
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}
