import type { ProductListItem } from "@/api/types/product";



export function formatPrice(value: number) {
    return `${value.toLocaleString("ar-IQ")} د.ع`;
}

export function shortDescription(text: string | null | undefined, max = 45) {
    if (!text?.trim()) return "—";
    const clean = text.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
    if (clean.length <= max) return clean;
    return `${clean.slice(0, max)}…`;
}

export function getProductCategories(product: ProductListItem) {
    const cats = product.categories ?? [];
    return cats
        .map((c: any, idx: number) => ({
            id: getCategoryId(c, idx),
            name: getCategoryName(c),
        }))
        .filter((c) => c.name);
}

export function getCategoryName(c: any): string {
    return c?.category?.name ?? c?.name ?? "";
}

export function getCategoryId(c: any, idx: number): string {
    return c?.category?.id ?? c?.id ?? String(idx);
}

export function costMargin(price: number, cost: number) {
    if (!cost || cost <= 0) return null;
    return ((price - cost) / cost) * 100;
}

