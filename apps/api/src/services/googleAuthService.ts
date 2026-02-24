import { OAuth2Client } from "google-auth-library";
import { prisma } from "../lib/prisma";
import { encrypt } from "@calsync/shared";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID ?? "";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET ?? "";
const BASE_URL = process.env.BASE_URL ?? "http://localhost:3000";
/** Public URL of this API (for OAuth redirect_uri). Default local: http://localhost:4000 */
const API_PUBLIC_URL = process.env.API_PUBLIC_URL ?? "http://localhost:4000";

const SCOPES = [
  "https://www.googleapis.com/auth/calendar.readonly",
  "https://www.googleapis.com/auth/calendar.events",
];

const STATE_TTL_MS = 10 * 60 * 1000; // 10 min

export function getRedirectUri(): string {
  return `${API_PUBLIC_URL.replace(/\/$/, "")}/auth/google/callback`;
}

export async function createState(userId: string): Promise<string> {
  const state = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + STATE_TTL_MS);
  await prisma.oAuthState.create({
    data: { userId, state, expiresAt },
  });
  return state;
}

export async function consumeState(state: string): Promise<{ userId: string } | null> {
  const row = await prisma.oAuthState.findUnique({
    where: { state },
  });
  if (!row || row.expiresAt < new Date()) {
    return null;
  }
  await prisma.oAuthState.delete({ where: { id: row.id } });
  return { userId: row.userId };
}

export function buildAuthorizeUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: getRedirectUri(),
    response_type: "code",
    scope: SCOPES.join(" "),
    state,
    access_type: "offline",
    prompt: "consent",
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export async function exchangeCodeForTokens(
  code: string
): Promise<{ refresh_token: string; email?: string } | null> {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    return null;
  }
  const client = new OAuth2Client(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, getRedirectUri());
  const { tokens } = await client.getToken(code);
  if (!tokens.refresh_token) {
    return null;
  }
  let email: string | undefined;
  if (tokens.id_token) {
    try {
      const ticket = await client.verifyIdToken({ idToken: tokens.id_token });
      email = ticket.getPayload()?.email;
    } catch {
      // ignore
    }
  }
  return { refresh_token: tokens.refresh_token, email };
}

export async function upsertCalendarConnection(
  userId: string,
  refreshToken: string,
  email?: string
): Promise<void> {
  const encrypted = encrypt(refreshToken);
  const scopes = SCOPES.join(",");
  await prisma.calendarConnection.upsert({
    where: {
      userId_provider: { userId, provider: "GOOGLE" },
    },
    create: {
      userId,
      provider: "GOOGLE",
      encryptedRefreshToken: encrypted,
      scopes,
      email: email ?? null,
    },
    update: {
      encryptedRefreshToken: encrypted,
      scopes,
      email: email ?? null,
    },
  });
}

export function getSettingsRedirect(): string {
  return `${BASE_URL.replace(/\/$/, "")}/settings/integrations?connected=1`;
}
