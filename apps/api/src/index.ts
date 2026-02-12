import express, { Request, Response } from "express";
import pino from "pino";

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

app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

app.listen(PORT, () => {
  logger.info({ port: PORT }, "API listening");
});
