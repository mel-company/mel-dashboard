export type DiscountListItem = {
  id: string;
  name: string;
  description?: string | null;
  discount_percentage: number;
  discount_start_date: string;
  discount_end_date: string;
  discount_status: string;
  image?: string | null;
  baseUrl?: string;
  usage_count?: number;
  discount_products?: { id: string }[];
  discount_categories?: { id: string }[];
  _count?: {
    products?: number;
    categories?: number;
    redemptions?: number;
    orders?: number;
  };
};

export type CreateDiscountInput = {
  storeId: string;
  name: string;
  description?: string;
  discount_percentage: number;
  discount_start_date: string;
  discount_end_date: string;
  discount_status?: string;
  image: string;
  imageFile?: File;
  productIds?: string[];
  categoryIds?: string[];
};
