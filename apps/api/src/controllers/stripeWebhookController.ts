import { Request, Response } from "express";
import Stripe from "stripe";
import { getStripeClient } from "../services/stripeService";
import * as orderService from "../services/orderService";
import * as emailService from "../services/emailService";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? "";

export async function handleStripeWebhook(req: Request, res: Response) {
  const signature = req.headers["stripe-signature"] as string | undefined;
  if (!signature || !webhookSecret) {
    res.status(400).json({ error: "Missing signature or webhook secret" });
    return;
  }

  let event: Stripe.Event;
  const rawBody = req.body as Buffer | string;
  const payload = Buffer.isBuffer(rawBody) ? rawBody : Buffer.from(rawBody, "utf8");

  try {
    const stripe = getStripeClient();
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(400).json({ error: `Webhook signature verification failed: ${message}` });
    return;
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.orderId;
    if (!orderId) {
      res.status(200).send();
      return;
    }
    const updated = await orderService.markOrderPaid(orderId);
    if (updated) {
      await orderService.createPayment(
        orderId,
        "stripe",
        session.id,
        "succeeded"
      );
      emailService.sendOrderConfirmation(orderId).catch((err) => {
        console.error("[webhook] Order confirmation email failed for", orderId, err);
      });
    }
  }

  res.status(200).send();
}
