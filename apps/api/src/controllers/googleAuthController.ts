import { Request, Response } from "express";
import { z } from "zod";
import * as googleAuthService from "../services/googleAuthService";

const callbackQuerySchema = z.object({
  code: z.string().min(1),
  state: z.string().min(1),
});

export async function start(req: Request, res: Response) {
  const userId = req.user?.sub;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    const state = await googleAuthService.createState(userId);
    const redirectUrl = googleAuthService.buildAuthorizeUrl(state);
    res.status(200).json({ redirectUrl });
  } catch (err) {
    console.error("[googleAuth] start failed", err);
    res.status(500).json({ error: "Failed to start Google sign-in" });
  }
}

export async function callback(req: Request, res: Response) {
  const parsed = callbackQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.redirect(googleAuthService.getSettingsRedirect() + "&error=invalid_callback");
    return;
  }
  const { code, state } = parsed.data;

  const stateData = await googleAuthService.consumeState(state);
  if (!stateData) {
    res.redirect(googleAuthService.getSettingsRedirect() + "&error=invalid_state");
    return;
  }

  const tokens = await googleAuthService.exchangeCodeForTokens(code);
  if (!tokens) {
    res.redirect(googleAuthService.getSettingsRedirect() + "&error=exchange_failed");
    return;
  }

  try {
    await googleAuthService.upsertCalendarConnection(
      stateData.userId,
      tokens.refresh_token,
      tokens.email
    );
  } catch (err) {
    console.error("[googleAuth] upsert connection failed", err);
    res.redirect(googleAuthService.getSettingsRedirect() + "&error=save_failed");
    return;
  }

  res.redirect(googleAuthService.getSettingsRedirect());
}
