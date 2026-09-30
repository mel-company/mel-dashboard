export type DashboardHomeQuery = {
  storeId?: string;
  from?: string;
  to?: string;
};

export type DashboardHomeResponse = {
  header: {
    title: string;
    subtitle: string;
    unreadNotifications: number;
  };
  revenueCard: {
    totalOrdersAmount: number;
    currency: string;
    growthPercent: number;
    lineA: number[];
    lineB: number[];
    months: string[];
    pendingAmount: number;
    deliveredAmount: number;
  };
  bestArrivalDay: {
    day: string;
    bars: number[];
  };
  topProducts: Array<{
    id: string;
    name: string;
    orders: number;
    rank: number;
    trend: "up" | "down" | "flat";
    imageUrl: string | null;
  }>;
  ordersCard: {
    totalOrders: number;
    area: number[];
  };
  storeRevenue: {
    amount: number;
    lastMonth: number;
    progress: number;
  };
  salesReading: {
    status: string;
    trendPercent: number;
    wave: number[];
  };
  orderStatusPie: Array<{
    key: string;
    label: string;
    value: number;
    color: string;
    /** Optional — Figma shows a period trend beside each status. */
    trendPercent?: number | null;
  }>;
  paymentTypes: Array<{
    key: string;
    label: string;
    count: number;
  }>;
  topCustomers: Array<{
    id: string;
    name: string;
    phone: string;
    orders: number;
    rank: number;
    avatarUrl: string | null;
  }>;
  subscription: {
    planCode: string | null;
    planTitle: string | null;
    /** Optional — Figma shows the plan's pitch under its name. */
    planDescription?: string | null;
    expiresAt: string | null;
    daysLeft: number;
    /** Percentage of the term elapsed, 0–100. */
    progress: number;
  };
  topCategories: Array<{
    id: string;
    name: string;
    orders: number;
    percent: number;
    rank: number;
    trend: "up" | "down" | "flat";
    imageUrl: string | null;
  }>;
  supportReports: {
    labels: string[];
    solved: number[];
    requests: number[];
  };
  topCoupons: Array<{
    id: string;
    title: string;
    code: string;
    /** Optional — Figma shows the value and its kind, not the code. */
    value?: string | null;
    valueType?: string | null;
    uses: number;
    progress: number;
    rank: number;
  }>;
};
