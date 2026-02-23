/**
 * Format cents as USD currency (e.g. 1999 → "$19.99").
 */
export function formatCents(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(cents / 100);
}

export type DateFormatStyle = "short" | "medium" | "long";

/**
 * Format an ISO date string for display.
 * @param date - ISO date string
 * @param dateStyle - "short" (compact), "medium" (default), or "long"
 */
export function formatDate(
  date: string,
  dateStyle: DateFormatStyle = "medium"
): string {
  return new Date(date).toLocaleString(undefined, {
    dateStyle,
    timeStyle: "short",
  });
}
