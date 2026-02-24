/**
 * Smoke test: load one CalendarConnection and decrypt the refresh token.
 * Confirms worker can read from DB and use shared encryption. No Google API calls.
 * Run: npm run smoke:decrypt (requires DATABASE_URL and ENCRYPTION_KEY).
 */
import { PrismaClient } from "@prisma/client";
import { decrypt } from "@calsync/shared";

const prisma = new PrismaClient();

async function main() {
  const conn = await prisma.calendarConnection.findFirst({
    where: { provider: "GOOGLE" },
  });
  if (!conn) {
    console.log("No Google calendar connection found. Connect one via the app first.");
    process.exit(0);
    return;
  }
  try {
    const plain = decrypt(conn.encryptedRefreshToken);
    console.log("Decrypted refresh token length:", plain.length);
    console.log("Smoke test OK: worker can decrypt stored token.");
  } catch (err) {
    console.error("Decrypt failed:", err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
