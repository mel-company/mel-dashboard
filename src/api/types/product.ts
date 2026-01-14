export type ProductCategoryListItem = {
  id: string;
  name: string;
};

export type ProductStoreListItem = {
  id: string;
  name: string;
};

export type ProductListItem = {
  id: string;
  title: string;
  description: string | null;
  price: number;
  cost_to_produce: number;
  image: string | null;
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

export type ProductListResponse =
  | ProductListItem[]
  | {
      data: ProductListItem[];
      total: number;
      page: number;
      limit: number;
    };
