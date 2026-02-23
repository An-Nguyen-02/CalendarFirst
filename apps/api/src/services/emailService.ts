import { Resend } from "resend";
import { prisma } from "../lib/prisma";

const apiKey = process.env.RESEND_API_KEY ?? "";
const fromEmail = process.env.FROM_EMAIL ?? "onboarding@resend.dev";

/**
 * Send order confirmation email to the order owner when order is PAID.
 * Best-effort: logs and returns without throwing if Resend is not configured or send fails.
 */
export async function sendOrderConfirmation(orderId: string): Promise<void> {
  if (!apiKey) {
    console.info("[email] RESEND_API_KEY not set; skipping order confirmation email for order", orderId);
    return;
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      user: { select: { email: true } },
      event: { select: { title: true, startAt: true, venue: true } },
      items: { include: { ticketType: { select: { name: true } } } },
    },
  });

  if (!order || order.status !== "PAID") {
    return;
  }

  const to = order.user.email;
  const eventTitle = order.event.title;
  const totalFormatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(order.totalCents / 100);

  const lines = order.items.map(
    (i) => `  • ${i.qty}× ${i.ticketType.name}`
  );
  const itemsList = lines.join("\n");

  const html = `
    <h1>Order confirmed</h1>
    <p>Thanks for your purchase. Here are your ticket details.</p>
    <p><strong>${eventTitle}</strong></p>
    <p>${order.event.venue ? `Venue: ${order.event.venue}<br/>` : ""}
    Date: ${new Date(order.event.startAt).toLocaleString()}</p>
    <h2>Your order</h2>
    <pre>${itemsList}</pre>
    <p><strong>Total: ${totalFormatted}</strong></p>
    <p>See you there!</p>
  `.replace(/\n\s+/g, "\n").trim();

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: fromEmail,
      to,
      subject: `Order confirmed: ${eventTitle}`,
      html,
    });
    if (error) {
      console.error("[email] Resend error for order", orderId, error);
    }
  } catch (err) {
    console.error("[email] Failed to send order confirmation for order", orderId, err);
  }
}
