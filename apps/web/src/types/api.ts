export type UserRole = "ORGANIZER" | "ATTENDEE";
export type User = { id: string; email: string; role?: UserRole };

export type LoginResponse = {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
  user: User;
};

export type OrgSummary = { id: string; name: string; role: string };
export type OrgsResponse = { orgs: OrgSummary[] };

export type EventSummary = {
  id: string;
  title: string;
  description: string | null;
  startAt: string;
  endAt: string;
  venue: string | null;
  status: string;
  capacity: number | null;
  orgId: string;
};
export type EventsResponse = { events: EventSummary[] };

export type TicketTypeSummary = {
  id: string;
  name: string;
  priceCents: number;
  currency: string;
  quantityTotal: number;
  quantitySold: number;
};
export type TicketTypesResponse = { ticketTypes: TicketTypeSummary[] };

export type OrderItemSummary = {
  id: string;
  qty: number;
  unitPriceCents: number;
  ticketType: { id: string; name: string };
};
export type OrderSummary = {
  id: string;
  status: string;
  totalCents: number;
  createdAt: string;
  event: EventSummary;
  items: OrderItemSummary[];
};
export type OrdersResponse = { orders: OrderSummary[] };

export type CreateOrderBody = { items: { ticketTypeId: string; qty: number }[] };
export type CheckoutResponse = { url: string };
