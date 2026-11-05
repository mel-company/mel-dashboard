/**
 * Maps dashboard routes → Arabic Module.name (PLATFORM_MODULES).
 * Owner (`isOwner`) bypasses these checks.
 */

export type ModulePermission = {
  module: string;
  view: boolean;
  add: boolean;
  edit: boolean;
  delete: boolean;
};

/** Paths that every signed-in staff member can always open. */
export const ALWAYS_ALLOWED_PATHS = new Set([
  "/",
  "/notifications",
  "/profile",
  "/request-access",
]);

/**
 * First matching prefix wins. Empty module = always allowed for staff.
 * Owner-only pages use module `الإعدادات` (employees typically lack it).
 */
export const PATH_MODULE_MAP: Array<{ prefix: string; module: string | null }> =
  [
    { prefix: "/employees", module: "الإعدادات" },
    { prefix: "/settings", module: "الإعدادات" },
    { prefix: "/access-requests", module: "الإعدادات" },
    { prefix: "/products", module: "المنتجات" },
    { prefix: "/categories", module: "المنتجات" },
    { prefix: "/collections", module: "المنتجات" },
    { prefix: "/editor", module: "المنتجات" },
    { prefix: "/discounts", module: "التسويق" },
    { prefix: "/coupons", module: "التسويق" },
    { prefix: "/orders", module: "الطلبات" },
    { prefix: "/pos", module: "الطلبات" },
    { prefix: "/customers", module: "العملاء" },
    { prefix: "/tickets", module: "الدعم" },
    { prefix: "/stats", module: "التحليلات" },
    { prefix: "/accounting", module: "المدفوعات" },
    { prefix: "/app-store", module: "الإعدادات" },
  ];

export const REQUESTABLE_MODULES = [
  "المنتجات",
  "الطلبات",
  "العملاء",
  "التحليلات",
  "التسويق",
  "المخزون",
  "المدفوعات",
  "الشحن",
  "الدعم",
  "الإعدادات",
] as const;

export function moduleForPath(pathname: string): string | null | undefined {
  if (ALWAYS_ALLOWED_PATHS.has(pathname)) return null;
  const hit = PATH_MODULE_MAP.find(
    (row) =>
      pathname === row.prefix || pathname.startsWith(`${row.prefix}/`),
  );
  return hit ? hit.module : undefined;
}

export function canViewModule(
  isOwner: boolean | undefined,
  permissions: ModulePermission[] | undefined,
  moduleName: string | null | undefined,
): boolean {
  if (isOwner) return true;
  if (moduleName === null || moduleName === undefined) return true;
  const row = permissions?.find((p) => p.module === moduleName);
  return Boolean(row?.view);
}

export function canViewPath(
  pathname: string,
  isOwner: boolean | undefined,
  permissions: ModulePermission[] | undefined,
): boolean {
  const mod = moduleForPath(pathname);
  if (mod === undefined) {
    // Unknown path — owners ok; employees blocked unless home-like.
    return Boolean(isOwner);
  }
  return canViewModule(isOwner, permissions, mod);
}
