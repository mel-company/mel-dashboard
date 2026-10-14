/** Localized name from API `{ ar, en }` or a plain string. */
function localizedName(name: unknown): string {
  if (typeof name === "string") return name.trim();
  if (name && typeof name === "object") {
    const n = name as Record<string, string | undefined>;
    return (
      n.arabic?.trim() ||
      n.ar?.trim() ||
      n.english?.trim() ||
      n.en?.trim() ||
      ""
    );
  }
  return "";
}

/** Build «محافظة - منطقة - نقطة» from an order's delivery fields. */
export function formatOrderDeliveryLocation(order: unknown): string {
  if (!order || typeof order !== "object") return "";
  const o = order as Record<string, unknown>;
  const state = localizedName((o.state as { name?: unknown } | undefined)?.name);
  const region = localizedName(
    (o.region as { name?: unknown } | undefined)?.name,
  );
  const point = String(o.nearest_point ?? o.address ?? "").trim();
  return [state, region, point].filter(Boolean).join(" - ");
}

function firstOrderLocation(customer: Record<string, unknown>): string {
  const candidates: unknown[] = [];
  if (customer.lastOrder) candidates.push(customer.lastOrder);
  if (customer.latestOrder) candidates.push(customer.latestOrder);
  if (Array.isArray(customer.orders)) candidates.push(...customer.orders);

  for (const order of candidates) {
    const fromOrder = formatOrderDeliveryLocation(order);
    if (fromOrder) return fromOrder;
  }
  return "";
}

/**
 * What to show in the «الموقع» column.
 *
 * The list API often leaves `user.location` null — the delivery address lives
 * on the order. Prefer an explicit location, then any address the payload
 * already embeds (last order / default address), so the cell is not empty
 * when the server did send something usable.
 */
export function getCustomerLocation(customer: unknown): string {
  if (!customer || typeof customer !== "object") return "";
  const c = customer as Record<string, unknown>;
  const user = c.user as Record<string, unknown> | undefined;

  const direct = String(
    user?.location ??
      c.location ??
      c.address ??
      c.lastDeliveryAddress ??
      user?.address ??
      "",
  ).trim();
  if (direct) return direct;

  return firstOrderLocation(c);
}

/** Stored `user.location` only — empty when the list never got a sync. */
export function getStoredCustomerLocation(customer: unknown): string {
  if (!customer || typeof customer !== "object") return "";
  const c = customer as Record<string, unknown>;
  const user = c.user as Record<string, unknown> | undefined;
  return String(user?.location ?? c.location ?? "").trim();
}
