import { formatCurrency } from "@/utils/format-currency";

export function formatDateTime(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export function formatDate(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function formatTime(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export function formatIQD(value: number) {
  return formatCurrency(value, "0 د.ع");
}

export function shortText(text: string | null | undefined, max = 70) {
  if (!text?.trim()) return "لا يوجد وصف";
  const clean = text.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max)}…`;
}

export function shortId(id?: string | number | null) {
  if (id == null) return "—";
  return `#${String(id).slice(0, 6)}`;
}

export function getCategoryType(category: any): {
  kind: "main" | "sub";
  label: string;
  parentName?: string;
} {
  const group =
    category?.group ??
    category?.groups?.[0] ??
    category?.categoryGroup ??
    category?.parent;
  const name = group?.name ?? (typeof group === "string" ? group : "");
  if (name) return { kind: "sub", label: "فرعي", parentName: name };
  return { kind: "main", label: "رئيسي" };
}

export function getCategoryCapital(category: any): {
  value: number | null;
  growth: number | null;
} {
  const raw =
    category?.capital ??
    category?.totalCapital ??
    category?.totalCost ??
    category?.cost ??
    category?.productsValue ??
    category?._sum?.cost_to_produce;
  const growthRaw =
    category?.capitalGrowth ??
    category?.growth ??
    category?.changePercent ??
    category?.change_percent;
  const value = typeof raw === "number" && Number.isFinite(raw) ? raw : null;
  const growth =
    typeof growthRaw === "number" && Number.isFinite(growthRaw)
      ? growthRaw
      : null;
  return { value, growth };
}

export function getGroupCategories(group: any): Array<{ id: string; name: string }> {
  const cats = group?.categories ?? [];
  return cats
    .map((c: any, idx: number) => ({
      id: c?.id ?? c?.category?.id ?? String(idx),
      name: c?.name ?? c?.category?.name ?? "",
    }))
    .filter((c: { name: string }) => c.name);
}
