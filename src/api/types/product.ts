export type ProductCategoryListItem = {
  id: string;
  name: string;
};

export type ProductStoreListItem = {
  id: string;
  name: string;
};

/** Product gallery image (ProductImage) — max 10 per product */
export type ProductImage = {
  id: string;
  url: string;
  sortOrder?: number;
  isPrimary?: boolean;
};

export type ProductListItem = {
  id: string;
  title: string;
  description: string | null;
  price: number;
  cost_to_produce: number;
  /** Shipping dimensions — grams and whole centimetres. Null when unmeasured. */
  weightGrams?: number | null;
  lengthCm?: number | null;
  widthCm?: number | null;
  heightCm?: number | null;
  /** Primary cover image (kept for backward compatibility) */
  image: string | null;
  /** Full gallery when returned by detail/list endpoints */
  images?: ProductImage[];
  rate: number;
  enabled: boolean;
  store?: ProductStoreListItem;
  categories?: ProductCategoryListItem[];
  _count?: {
    categories: number;
    discounts: number;
    orders: number;
  };
  createdAt?: string;
};

export const MAX_PRODUCT_IMAGES = 10;

export type ProductListResponse =
  | ProductListItem[]
  | {
      data: ProductListItem[];
      total: number;
      page: number;
      limit: number;
    };
