export type CouponListItem = {
  id: string;
  code: string;
  description?: string | null;
  value: number;
  type?: "PERCENTAGE" | "FIXED" | string;
  appliesTo?: string;
  isActive: boolean;
  minOrderTotal?: number | null;
  usageLimit?: number | null;
  usedCount?: number;
  startsAt?: string | null;
  expiresAt?: string | null;
  _count?: {
    products?: number;
    categories?: number;
    redemptions?: number;
  };
};

export type CreateCouponInput = {
  code: string;
  description?: string;
  type: "PERCENTAGE" | "FIXED";
  value: number;
  appliesTo?: string;
  isActive?: boolean;
  minOrderTotal?: number;
  usageLimit?: number;
  startsAt?: string;
  expiresAt?: string;
};
