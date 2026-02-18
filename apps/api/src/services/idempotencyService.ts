import { prisma } from "../lib/prisma";

export async function getCachedResponse(
  key: string,
  userId: string,
  endpoint: string
): Promise<string | null> {
  const record = await prisma.idempotencyKey.findUnique({
    where: {
      userId_endpoint_key: { userId, endpoint, key },
    },
  });
  if (!record || record.expiresAt < new Date()) return null;
  return record.responseRef;
}

export async function storeResponse(
  key: string,
  userId: string,
  endpoint: string,
  responseRef: string,
  expiresAt: Date
): Promise<void> {
  await prisma.idempotencyKey.upsert({
    where: {
      userId_endpoint_key: { userId, endpoint, key },
    },
    create: { key, userId, endpoint, responseRef, expiresAt },
    update: { responseRef, expiresAt },
  });
}
