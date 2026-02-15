import express, { Request, Response } from "express";
import pino from "pino";
import { prisma } from "./lib/prisma";
import authRoutes from "./routes/auth";
import orgRoutes from "./routes/org";

const PORT = 4000;

const logger = pino({
  level: process.env.LOG_LEVEL ?? "info",
  ...(process.env.NODE_ENV !== "production" && {
    transport: { target: "pino-pretty", options: { colorize: true } },
  }),
});

const app = express();

// Extend Express Request to include requestId
declare global {
  namespace Express {
    interface Request {
      requestId?: string;
    }
  }
}

// Request ID: generate or use incoming header; set on req and response
app.use((req, res, next) => {
  const id =
    (req.headers["x-request-id"] as string | undefined) ??
    crypto.randomUUID();
  req.requestId = id;
  res.setHeader("X-Request-Id", id);
  next();
});

// Structured request logging (method, url, requestId; log response on finish)
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    logger.info({
      requestId: req.requestId,
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      responseTimeMs: Date.now() - start,
    });
  });
  next();
});

app.use(express.json());

app.use("/auth", authRoutes);
app.use("/orgs", orgRoutes);

app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

app.get("/health/db", async (_req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({
      status: "ok",
      database: "connected",
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    logger.error({ err }, "Database health check failed");
    res.status(500).json({
      status: "error",
      database: "disconnected",
      timestamp: new Date().toISOString(),
    });
  }
});

app.listen(PORT, () => {
  logger.info({ port: PORT }, "API listening");
});
