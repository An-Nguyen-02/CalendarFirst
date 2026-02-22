import Stripe from "stripe";
import type { Order, OrderItem, TicketType } from "@prisma/client";

type OrderWithItems = Order & {
  items: (OrderItem & { ticketType: TicketType })[];
};

let stripeInstance: Stripe | null = null;

function getStripe(): Stripe {
  if (!stripeInstance) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key || key === "") {
      throw new Error("Stripe is not configured: STRIPE_SECRET_KEY is missing");
    }
    stripeInstance = new Stripe(key);
  }
  return stripeInstance;
}

export async function createCheckoutSession(
  order: OrderWithItems,
  successUrl: string,
  cancelUrl: string
): Promise<string> {
  const stripe = getStripe();
  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = order.items.map(
    (item) => ({
      price_data: {
        currency: item.ticketType.currency.toLowerCase(),
        unit_amount: item.unitPriceCents,
        product_data: {
          name: item.ticketType.name,
        },
      },
      quantity: item.qty,
    })
  );

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: lineItems,
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      orderId: order.id,
      userId: order.userId,
    },
  });

  if (!session.url) {
    throw new Error("Stripe did not return a checkout URL");
  }
  return session.url;
}

export function getStripeClient(): Stripe {
  return getStripe();
}
