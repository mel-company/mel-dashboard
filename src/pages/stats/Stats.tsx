import { useMemo } from "react";
import {
  TrendingUp,
  Package,
  Layers,
  Tag,
  Users,
  BarChart3,
  Activity,
  DollarSign,
  FileText,
  Download,
  Calendar,
  ShoppingBag,
} from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Chart, Bar, Line, Doughnut, Radar, PolarArea } from "react-chartjs-2";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Dummy data (نفس بيانات Home للإحصائيات)
const dmy_orders = [
  { id: 1, status: "pending", products: [{ price: 50 }, { price: 30 }] },
  { id: 2, status: "processing", products: [{ price: 75 }] },
  { id: 3, status: "shipped", products: [{ price: 120 }, { price: 45 }] },
  { id: 4, status: "delivered", products: [{ price: 90 }] },
  { id: 5, status: "pending", products: [{ price: 65 }] },
  { id: 6, status: "delivered", products: [{ price: 110 }] },
  { id: 7, status: "processing", products: [{ price: 85 }] },
  { id: 8, status: "shipped", products: [{ price: 95 }] },
];

const dmy_products = [
  {
    title: "Laptop Pro 15",
    rate: 4.5,
    price: 899,
    properties: { brand: "TechCorp" },
  },
  {
    title: "Wireless Mouse",
    rate: 4.2,
    price: 25,
    properties: { brand: "Logitech" },
  },
  {
    title: "Mechanical Keyboard",
    rate: 4.8,
    price: 120,
    properties: { brand: "Corsair" },
  },
  { title: "USB-C Hub", rate: 4.0, price: 45, properties: { brand: "Anker" } },
  {
    title: "Monitor 27 inch",
    rate: 4.6,
    price: 350,
    properties: { brand: "Dell" },
  },
  {
    title: "Webcam HD",
    rate: 3.9,
    price: 65,
    properties: { brand: "Logitech" },
  },
  { title: "Desk Lamp", rate: 4.3, price: 35, properties: { brand: "IKEA" } },
  {
    title: "Gaming Headset",
    rate: 4.7,
    price: 85,
    properties: { brand: "Corsair" },
  },
];

const dmy_categories = Array(8).fill(null);
const dmy_users = [
  { location: "Baghdad, Iraq" },
  { location: "Basra, Iraq" },
  { location: "Baghdad, Iraq" },
  { location: "Erbil, Iraq" },
  { location: "Basra, Iraq" },
  { location: "Mosul, Iraq" },
];

const dmy_discounts = [
  { discount_status: "ACTIVE" },
  { discount_status: "ACTIVE" },
  { discount_status: "EXPIRED" },
  { discount_status: "ACTIVE" },
];

const Stats = () => {
  // Detect theme (نفس من Home)
  const isDark = useMemo(
    () => document.documentElement.classList.contains("dark"),
    []
  );
  const textColor = isDark ? "#e5e7eb" : "#6b7280";
  const gridColor = isDark ? "#374151" : "#e5e7eb";
  const bgColor = isDark ? "#1f2937" : "#ffffff";

  // Chart.js default options
  const chartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: textColor,
            font: {
              family: "Cairo, sans-serif",
            },
          },
        },
        tooltip: {
          backgroundColor: bgColor,
          titleColor: textColor,
          bodyColor: textColor,
          borderColor: gridColor,
          borderWidth: 1,
        },
      },
      scales: {
        x: {
          ticks: {
            color: textColor,
            font: {
              family: "Cairo, sans-serif",
            },
          },
          grid: {
            color: gridColor,
            borderDash: [3, 3],
          },
        },
        y: {
          ticks: {
            color: textColor,
            font: {
              family: "Cairo, sans-serif",
            },
          },
          grid: {
            color: gridColor,
            borderDash: [3, 3],
          },
        },
      },
    }),
    [textColor, gridColor, bgColor]
  );

  // Order Status Chart Data
  const orderStatusData = useMemo(() => {
    const statusCounts = [
      {
        status: "Pending",
        count: dmy_orders.filter((o) => o.status === "pending").length,
      },
      {
        status: "Processing",
        count: dmy_orders.filter((o) => o.status === "processing").length,
      },
      {
        status: "Shipped",
        count: dmy_orders.filter((o) => o.status === "shipped").length,
      },
      {
        status: "Delivered",
        count: dmy_orders.filter((o) => o.status === "delivered").length,
      },
    ];

    return {
      labels: statusCounts.map((d) => d.status),
      datasets: [
        {
          label: "الطلبات",
          data: statusCounts.map((d) => d.count),
          backgroundColor: "#3b82f6",
          borderRadius: 8,
          borderSkipped: false,
        },
      ],
    };
  }, []);

  // Product Ratings Chart Data
  const productRatingsData = useMemo(() => {
    const productData = dmy_products.slice(0, 6).map((p) => ({
      name: p.title.split(" ").slice(0, 2).join(" "),
      rating: p.rate,
      price: p.price,
    }));

    return {
      labels: productData.map((p) => p.name),
      datasets: [
        {
          label: "التقييم",
          data: productData.map((p) => p.rating),
          backgroundColor: "#10b981",
          type: "bar" as const,
          yAxisID: "y",
          borderRadius: 6,
        },
        {
          label: "السعر ($)",
          data: productData.map((p) => p.price),
          borderColor: "#f59e0b",
          backgroundColor: "transparent",
          type: "line" as const,
          yAxisID: "y1",
          tension: 0.4,
        },
      ],
    };
  }, []);

  const productRatingsOptions = useMemo(() => {
    return {
      ...chartOptions,
      scales: {
        ...chartOptions.scales,
        y: {
          ...chartOptions.scales.y,
          type: "linear" as const,
          position: "left" as const,
          title: {
            display: true,
            text: "التقييم",
            color: "#10b981",
          },
        },
        y1: {
          type: "linear" as const,
          position: "right" as const,
          title: {
            display: true,
            text: "السعر ($)",
            color: "#f59e0b",
          },
          ticks: {
            color: textColor,
            font: {
              family: "Cairo, sans-serif",
            },
          },
          grid: {
            drawOnChartArea: false,
          },
        },
      },
    };
  }, [chartOptions, textColor]);

  // Brand Distribution Chart Data
  const brandData = useMemo(() => {
    const brandCounts = dmy_products.reduce(
      (acc: { brand: string; count: number }[], product) => {
        const brand = product.properties.brand;
        const existing = acc.find((item) => item.brand === brand);
        if (existing) existing.count++;
        else acc.push({ brand, count: 1 });
        return acc;
      },
      []
    );

    return {
      labels: brandCounts.map((d) => d.brand),
      datasets: [
        {
          label: "المنتجات",
          data: brandCounts.map((d) => d.count),
          backgroundColor: [
            "#3b82f6",
            "#10b981",
            "#f59e0b",
            "#ef4444",
            "#8b5cf6",
            "#ec4899",
          ],
          borderWidth: 0,
        },
      ],
    };
  }, []);

  const brandChartOptions = useMemo(
    () => ({
      ...chartOptions,
      cutout: "65%",
      plugins: {
        ...chartOptions.plugins,
        legend: {
          ...chartOptions.plugins.legend,
          position: "bottom" as const,
        },
      },
    }),
    [chartOptions]
  );

  // User Locations Chart Data (using Radar)
  const locationData = useMemo(() => {
    const locationCounts = dmy_users.reduce(
      (acc: { location: string; users: number }[], user) => {
        const location = user.location.split(",")[0];
        const existing = acc.find((item) => item.location === location);
        if (existing) existing.users++;
        else acc.push({ location, users: 1 });
        return acc;
      },
      []
    );

    return {
      labels: locationCounts.map((d) => d.location),
      datasets: [
        {
          label: "المستخدمين",
          data: locationCounts.map((d) => (d.users / dmy_users.length) * 100),
          backgroundColor: "rgba(59, 130, 246, 0.2)",
          borderColor: "#3b82f6",
          pointBackgroundColor: "#3b82f6",
          pointBorderColor: "#fff",
          pointHoverBackgroundColor: "#fff",
          pointHoverBorderColor: "#3b82f6",
        },
      ],
    };
  }, []);

  const locationChartOptions = useMemo(
    () => ({
      ...chartOptions,
      scales: {
        r: {
          ticks: {
            color: textColor,
            font: {
              family: "Cairo, sans-serif",
            },
            backdropColor: "transparent",
          },
          grid: {
            color: gridColor,
          },
          pointLabels: {
            color: textColor,
            font: {
              family: "Cairo, sans-serif",
            },
          },
        },
      },
      plugins: {
        ...chartOptions.plugins,
        legend: {
          ...chartOptions.plugins.legend,
          position: "bottom" as const,
        },
      },
    }),
    [chartOptions, textColor, gridColor]
  );

  // Monthly Sales Chart Data
  const salesData = useMemo(() => {
    const monthlySalesData = [
      { month: "Jan", sales: 4500, orders: 12 },
      { month: "Feb", sales: 5200, orders: 15 },
      { month: "Mar", sales: 4800, orders: 14 },
      { month: "Apr", sales: 6100, orders: 18 },
      { month: "May", sales: 5500, orders: 16 },
      { month: "Jun", sales: 7200, orders: 22 },
    ];

    return {
      labels: monthlySalesData.map((d) => d.month),
      datasets: [
        {
          label: "المبيعات ($)",
          data: monthlySalesData.map((d) => d.sales),
          borderColor: "#3b82f6",
          backgroundColor: "rgba(59, 130, 246, 0.1)",
          fill: true,
          tension: 0.4,
        },
        {
          label: "الطلبات",
          data: monthlySalesData.map((d) => d.orders * 100),
          borderColor: "#10b981",
          backgroundColor: "rgba(16, 185, 129, 0.1)",
          fill: true,
          tension: 0.4,
        },
      ],
    };
  }, []);

  // Price Range Chart Data
  const priceData = useMemo(() => {
    const priceRangeData = [
      {
        range: "$0-25",
        count: dmy_products.filter((p) => p.price <= 25).length,
      },
      {
        range: "$26-50",
        count: dmy_products.filter((p) => p.price > 25 && p.price <= 50).length,
      },
      {
        range: "$51-75",
        count: dmy_products.filter((p) => p.price > 50 && p.price <= 75).length,
      },
      {
        range: "$76+",
        count: dmy_products.filter((p) => p.price > 75).length,
      },
    ];

    return {
      labels: priceRangeData.map((d) => d.range),
      datasets: [
        {
          label: "المنتجات",
          data: priceRangeData.map((d) => d.count),
          backgroundColor: [
            "rgba(59, 130, 246, 0.8)",
            "rgba(16, 185, 129, 0.8)",
            "rgba(245, 158, 11, 0.8)",
            "rgba(239, 68, 68, 0.8)",
          ],
          borderColor: "#fff",
          borderWidth: 2,
        },
      ],
    };
  }, []);

  const statsCards = [
    {
      title: "إجمالي الطلبات",
      value: dmy_orders.length,
      icon: TrendingUp,
      gradient: "from-blue-500 to-blue-600",
      bgGradient:
        "from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20",
      iconColor: "text-blue-600 dark:text-blue-400",
      change: "+12.5%",
      changeColor: "text-green-600 dark:text-green-400",
    },
    {
      title: "المنتجات",
      value: dmy_products.length,
      icon: Package,
      gradient: "from-emerald-500 to-emerald-600",
      bgGradient:
        "from-emerald-50 to-emerald-100/50 dark:from-emerald-950/30 dark:to-emerald-900/20",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      change: "+8.2%",
      changeColor: "text-green-600 dark:text-green-400",
    },
    {
      title: "الفئات",
      value: dmy_categories.length,
      icon: Layers,
      gradient: "from-amber-500 to-amber-600",
      bgGradient:
        "from-amber-50 to-amber-100/50 dark:from-amber-950/30 dark:to-amber-900/20",
      iconColor: "text-amber-600 dark:text-amber-400",
      change: "+5.1%",
      changeColor: "text-green-600 dark:text-green-400",
    },
    {
      title: "الخصومات النشطة",
      value: dmy_discounts.filter(
        (d: { discount_status: string }) => d.discount_status === "ACTIVE"
      ).length,
      icon: Tag,
      gradient: "from-purple-500 to-purple-600",
      bgGradient:
        "from-purple-50 to-purple-100/50 dark:from-purple-950/30 dark:to-purple-900/20",
      iconColor: "text-purple-600 dark:text-purple-400",
      change: "+3.7%",
      changeColor: "text-green-600 dark:text-green-400",
    },
    {
      title: "إجمالي المستخدمين",
      value: dmy_users.length,
      icon: Users,
      gradient: "from-rose-500 to-rose-600",
      bgGradient:
        "from-rose-50 to-rose-100/50 dark:from-rose-950/30 dark:to-rose-900/20",
      iconColor: "text-rose-600 dark:text-rose-400",
      change: "+15.3%",
      changeColor: "text-green-600 dark:text-green-400",
    },
  ];

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6 lg:space-y-8">
        {/* Header Section */}
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
            إحصائيات المتجر
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            نظرة تفصيلية على أداء المتجر، الطلبات، المنتجات والمستخدمين
          </p>
        </div>

        {/* Stats Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6">
          {statsCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="group relative bg-card rounded-2xl border border-border p-6 hover:border-border/80 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
              >
                {/* Background Gradient */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                />

                {/* Content */}
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className={`p-3 rounded-xl bg-gradient-to-br ${stat.bgGradient} group-hover:scale-110 transition-transform duration-300`}
                    >
                      <Icon className={`w-6 h-6 ${stat.iconColor}`} />
                    </div>
                    <div className="flex items-center gap-1 text-xs font-semibold">
                      <TrendingUp className="w-3 h-3" />
                      <span className={stat.changeColor}>{stat.change}</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-muted-foreground text-sm font-medium">
                      {stat.title}
                    </p>
                    <p className="text-3xl font-bold text-foreground">
                      {stat.value}
                    </p>
                  </div>
                </div>

                {/* Decorative Element */}
                <div
                  className={`absolute -bottom-4 -right-4 w-24 h-24 bg-gradient-to-br ${stat.gradient} opacity-5 rounded-full blur-2xl group-hover:opacity-10 transition-opacity duration-300`}
                />
              </div>
            );
          })}
        </div>

        {/* Reports Section */}
        <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/20 dark:via-indigo-950/20 dark:to-purple-950/20 rounded-2xl border border-blue-200/50 dark:border-blue-800/30 shadow-lg p-6 lg:p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-foreground">
                  تقارير المتجر الخاصة
                </h2>
                <p className="text-sm text-muted-foreground">
                  اطلب تقارير مفصلة وجاهزة عن المبيعات والطلبات بصيغة PDF أو
                  Excel
                </p>
              </div>
            </div>

            <div className="flex-1 max-w-2xl space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    نوع التقرير
                  </label>
                  <Select defaultValue="daily-sales">
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="اختر نوع التقرير" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily-sales">
                        <div className="flex items-center gap-2">
                          <BarChart3 className="w-4 h-4" />
                          <span>تقرير المبيعات اليومي</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="monthly-sales">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>تقرير المبيعات الشهري</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="orders">
                        <div className="flex items-center gap-2">
                          <ShoppingBag className="w-4 h-4" />
                          <span>تقرير الطلبات التفصيلي</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    الفترة الزمنية
                  </label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="date"
                      className="h-10"
                      placeholder="من تاريخ"
                      aria-label="من تاريخ"
                    />
                    <span className="text-muted-foreground">–</span>
                    <Input
                      type="date"
                      className="h-10"
                      placeholder="إلى تاريخ"
                      aria-label="إلى تاريخ"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-border/50">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText className="w-4 h-4" />
                  <span>سيتم توليد التقرير بصيغة PDF / Excel</span>
                </div>
                <Button
                  type="button"
                  className="h-10 px-6 gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all"
                >
                  <Download className="w-4 h-4" />
                  تحميل التقرير
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="space-y-6">
          {/* Section Title */}
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent"></div>
            <h2 className="text-xl font-bold text-foreground px-4">
              التحليلات والجرافات
            </h2>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent"></div>
          </div>

          {/* Monthly Sales Chart - Full Width (Most Important) */}
          <div className="bg-card rounded-2xl border border-border p-6 shadow-sm hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-md">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">
                    اتجاه المبيعات الشهرية
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    متابعة المبيعات والطلبات على مدار الأشهر
                  </p>
                </div>
              </div>
            </div>
            <div className="h-[350px]">
              <Line data={salesData} options={chartOptions} />
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Order Status Chart */}
            <div className="bg-card rounded-2xl border border-border p-6 shadow-sm hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-blue-100 dark:bg-blue-950/50 rounded-lg">
                    <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground">
                      حالة الطلبات
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      توزيع الطلبات حسب الحالة
                    </p>
                  </div>
                </div>
              </div>
              <div className="h-[280px]">
                <Bar data={orderStatusData} options={chartOptions} />
              </div>
            </div>

            {/* Product Ratings Chart */}
            <div className="bg-card rounded-2xl border border-border p-6 shadow-sm hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-100 dark:bg-emerald-950/50 rounded-lg">
                    <Activity className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground">
                      تقييمات وأسعار المنتجات
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      مقارنة التقييمات والأسعار
                    </p>
                  </div>
                </div>
              </div>
              <div className="h-[280px]">
                <Chart
                  type="bar"
                  data={productRatingsData}
                  options={productRatingsOptions}
                />
              </div>
            </div>

            {/* Brand Distribution Chart */}
            <div className="bg-card rounded-2xl border border-border p-6 shadow-sm hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-purple-100 dark:bg-purple-950/50 rounded-lg">
                    <Package className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground">
                      توزيع العلامات التجارية
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      نسبة المنتجات حسب العلامة
                    </p>
                  </div>
                </div>
              </div>
              <div className="h-[280px]">
                <Doughnut data={brandData} options={brandChartOptions} />
              </div>
            </div>

            {/* Price Ranges Chart */}
            <div className="bg-card rounded-2xl border border-border p-6 shadow-sm hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-amber-100 dark:bg-amber-950/50 rounded-lg">
                    <DollarSign className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground">
                      نطاقات الأسعار
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      توزيع المنتجات حسب السعر
                    </p>
                  </div>
                </div>
              </div>
              <div className="h-[280px]">
                <PolarArea data={priceData} options={chartOptions} />
              </div>
            </div>
          </div>

          {/* User Locations Chart - Full Width */}
          <div className="bg-card rounded-2xl border border-border p-6 shadow-sm hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl shadow-md">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">
                    مواقع المستخدمين
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    توزيع المستخدمين حسب الموقع الجغرافي
                  </p>
                </div>
              </div>
            </div>
            <div className="h-[350px]">
              <Radar data={locationData} options={locationChartOptions} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Stats;
