import { useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  TrendingUp,
  Package,
  Layers,
  Tag,
  Users,
  Edit,
  Store,
  ArrowUpRight,
  BarChart3,
  Activity,
  DollarSign,
} from "lucide-react";

// Declare ApexCharts globally
declare global {
  interface Window {
    ApexCharts: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  }
}

// Dummy data
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

const Home = () => {
  const navigate = useNavigate();

  const initCharts = useCallback(() => {
    // Detect theme
    const isDark = document.documentElement.classList.contains("dark");
    const textColor = isDark ? "#e5e7eb" : "#6b7280";
    const gridColor = isDark ? "#374151" : "#e5e7eb";

    // Clear any existing charts first
    const chartIds = [
      "#orderStatusChart",
      "#productRatingsChart",
      "#brandChart",
      "#locationChart",
      "#salesChart",
      "#priceChart",
      "#roleChart",
      "#discountChart",
      "#timelineChart",
      "#heatmapChart",
    ];

    chartIds.forEach((id) => {
      const element = document.querySelector(id);
      if (element) {
        element.innerHTML = "";
      }
    });

    // Order Status Chart
    const orderStatusData = [
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

    const orderChart = new (window as any).ApexCharts( // eslint-disable-line @typescript-eslint/no-explicit-any
      document.querySelector("#orderStatusChart"),
      {
        series: [
          {
            name: "Orders",
            data: orderStatusData.map((d) => d.count),
          },
        ],
        chart: {
          type: "bar",
          height: 300,
          toolbar: { show: false },
          fontFamily: "inherit",
        },
        colors: ["#3b82f6"],
        plotOptions: {
          bar: {
            borderRadius: 8,
            columnWidth: "60%",
            dataLabels: { position: "top" },
          },
        },
        dataLabels: {
          enabled: true,
          offsetY: -25,
          style: { fontSize: "12px", colors: [textColor] },
        },
        xaxis: {
          categories: orderStatusData.map((d) => d.status),
          labels: { style: { colors: textColor, fontSize: "12px" } },
        },
        yaxis: {
          labels: { style: { colors: textColor, fontSize: "12px" } },
        },
        grid: {
          borderColor: gridColor,
          strokeDashArray: 3,
        },
        theme: {
          mode: isDark ? "dark" : "light",
        },
      }
    );
    orderChart.render();

    // Product Ratings Chart
    const productData = dmy_products.slice(0, 6).map((p) => ({
      name: p.title.split(" ").slice(0, 2).join(" "),
      rating: p.rate,
      price: p.price,
    }));

    const ratingChart = new (window as any).ApexCharts( // eslint-disable-line @typescript-eslint/no-explicit-any
      document.querySelector("#productRatingsChart"),
      {
        series: [
          {
            name: "Rating",
            type: "column",
            data: productData.map((p) => p.rating),
          },
          {
            name: "Price",
            type: "line",
            data: productData.map((p) => p.price),
          },
        ],
        chart: {
          height: 300,
          type: "line",
          toolbar: { show: false },
          fontFamily: "inherit",
        },
        colors: ["#10b981", "#f59e0b"],
        stroke: { width: [0, 3], curve: "smooth" },
        plotOptions: {
          bar: { borderRadius: 6, columnWidth: "50%" },
        },
        dataLabels: { enabled: false },
        xaxis: {
          categories: productData.map((p) => p.name),
          labels: {
            rotate: -45,
            style: { colors: textColor, fontSize: "11px" },
          },
        },
        yaxis: [
          {
            title: { text: "Rating", style: { color: "#10b981" } },
            labels: { style: { colors: textColor } },
          },
          {
            opposite: true,
            title: { text: "Price ($)", style: { color: "#f59e0b" } },
            labels: { style: { colors: textColor } },
          },
        ],
        legend: { position: "top", horizontalAlign: "left" },
        grid: { borderColor: gridColor, strokeDashArray: 3 },
        theme: {
          mode: isDark ? "dark" : "light",
        },
      }
    );
    ratingChart.render();

    // Brand Distribution Donut
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const brandData: any[] = dmy_products.reduce((acc: any[], product) => {
      const brand = product.properties.brand;
      const existing = acc.find((item) => item.brand === brand);
      if (existing) existing.count++;
      else acc.push({ brand, count: 1 });
      return acc;
    }, []);

    const brandChart = new (window as any).ApexCharts( // eslint-disable-line @typescript-eslint/no-explicit-any
      document.querySelector("#brandChart"),
      {
        series: brandData.map((d) => d.count),
        chart: { type: "donut", height: 280, fontFamily: "inherit" },
        labels: brandData.map((d) => d.brand),
        colors: [
          "#3b82f6",
          "#10b981",
          "#f59e0b",
          "#ef4444",
          "#8b5cf6",
          "#ec4899",
        ],
        plotOptions: {
          pie: {
            donut: {
              size: "65%",
              labels: {
                show: true,
                total: {
                  show: true,
                  label: "Total Products",
                  formatter: () => dmy_products.length,
                },
              },
            },
          },
        },
        legend: { position: "bottom" },
        dataLabels: {
          formatter: (val: any) => Math.round(val) + "%", // eslint-disable-line @typescript-eslint/no-explicit-any
        },
        theme: {
          mode: isDark ? "dark" : "light",
        },
      }
    );
    brandChart.render();

    // User Locations Radial
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const locationData: any[] = dmy_users.reduce((acc: any[], user) => {
      const location = user.location.split(",")[0];
      const existing = acc.find((item) => item.location === location);
      if (existing) existing.users++;
      else acc.push({ location, users: 1 });
      return acc;
    }, []);

    const locationChart = new (window as any).ApexCharts( // eslint-disable-line @typescript-eslint/no-explicit-any
      document.querySelector("#locationChart"),
      {
        series: locationData.map((d) => (d.users / dmy_users.length) * 100),
        chart: { type: "radialBar", height: 300, fontFamily: "inherit" },
        plotOptions: {
          radialBar: {
            offsetY: 0,
            startAngle: 0,
            endAngle: 270,
            hollow: { margin: 5, size: "30%", background: "transparent" },
            dataLabels: {
              name: { fontSize: "14px" },
              value: {
                fontSize: "16px",
                formatter: (val: any) => Math.round(val) + "%", // eslint-disable-line @typescript-eslint/no-explicit-any
              },
            },
          },
        },
        colors: ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"],
        labels: locationData.map((d) => d.location),
        legend: { show: true, position: "bottom" },
        theme: {
          mode: isDark ? "dark" : "light",
        },
      }
    );
    locationChart.render();

    // Monthly Sales Area Chart
    const monthlySalesData = [
      { month: "Jan", sales: 4500, orders: 12 },
      { month: "Feb", sales: 5200, orders: 15 },
      { month: "Mar", sales: 4800, orders: 14 },
      { month: "Apr", sales: 6100, orders: 18 },
      { month: "May", sales: 5500, orders: 16 },
      { month: "Jun", sales: 7200, orders: 22 },
    ];

    const salesChart = new (window as any).ApexCharts( // eslint-disable-line @typescript-eslint/no-explicit-any
      document.querySelector("#salesChart"),
      {
        series: [
          { name: "Sales ($)", data: monthlySalesData.map((d) => d.sales) },
          { name: "Orders", data: monthlySalesData.map((d) => d.orders * 100) },
        ],
        chart: {
          type: "area",
          height: 300,
          toolbar: { show: false },
          fontFamily: "inherit",
        },
        colors: ["#3b82f6", "#10b981"],
        dataLabels: { enabled: false },
        stroke: { curve: "smooth", width: 2 },
        fill: {
          type: "gradient",
          gradient: {
            shadeIntensity: 1,
            opacityFrom: 0.5,
            opacityTo: 0.1,
          },
        },
        xaxis: {
          categories: monthlySalesData.map((d) => d.month),
          labels: { style: { colors: textColor } },
        },
        yaxis: {
          labels: { style: { colors: textColor } },
        },
        legend: { position: "top", horizontalAlign: "left" },
        grid: { borderColor: gridColor, strokeDashArray: 3 },
        theme: {
          mode: isDark ? "dark" : "light",
        },
        tooltip: {
          y: {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter: (val: any, { seriesIndex }: any) =>
              seriesIndex === 0 ? "$" + val : Math.round(val / 100) + " orders",
          },
        },
      }
    );
    salesChart.render();

    // Price Range Polar Chart
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
      { range: "$76+", count: dmy_products.filter((p) => p.price > 75).length },
    ];

    const priceChart = new (window as any).ApexCharts( // eslint-disable-line @typescript-eslint/no-explicit-any
      document.querySelector("#priceChart"),
      {
        series: priceRangeData.map((d) => d.count),
        chart: { type: "polarArea", height: 300, fontFamily: "inherit" },
        labels: priceRangeData.map((d) => d.range),
        colors: ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"],
        stroke: { colors: ["#fff"] },
        fill: { opacity: 0.8 },
        legend: { position: "bottom" },
        plotOptions: {
          polarArea: {
            rings: { strokeWidth: 1, strokeColor: gridColor },
            spokes: { strokeWidth: 1, strokeColor: gridColor },
          },
        },
        theme: {
          mode: isDark ? "dark" : "light",
        },
      }
    );
    priceChart.render();
  }, []);

  useEffect(() => {
    // Load ApexCharts
    const script = document.createElement("script");
    script.src =
      "https://cdnjs.cloudflare.com/ajax/libs/apexcharts/3.45.1/apexcharts.min.js";
    script.async = true;
    script.onload = () => {
      initCharts();
    };
    document.body.appendChild(script);

    return () => {
      // Cleanup charts
      const chartElements = document.querySelectorAll('[id$="Chart"]');
      chartElements.forEach((element) => {
        const chart = (element as any)._chart; // eslint-disable-line @typescript-eslint/no-explicit-any
        chart?.destroy?.();
      });
    };
  }, [initCharts]);

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
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                لوحة التحكم
              </h1>
              <p className="text-muted-foreground text-sm sm:text-base">
                نظرة شاملة على مقاييس أعمالك وإحصائياتك المهمة
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-4 py-2 bg-card rounded-lg border border-border shadow-sm">
                <Activity className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium text-foreground">
                  نظام نشط
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => navigate("/editor/templates")}
              className="group flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
            >
              <Store className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              <span className="font-medium">معرض القوالب</span>
              <ArrowUpRight className="w-4 h-4 opacity-70 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
            </button>
            <button
              onClick={() => navigate("/editor/templates")}
              className="group flex items-center gap-2 px-6 py-3 bg-card border-2 border-border text-foreground rounded-xl hover:border-border/80 hover:bg-accent transition-all duration-300 shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
            >
              <Edit className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              <span className="font-medium">محرر القوالب</span>
              <ArrowUpRight className="w-4 h-4 opacity-70 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
            </button>
          </div>
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
                      <ArrowUpRight className="w-3 h-3" />
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

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Order Status Chart */}
          <div className="bg-card rounded-2xl border border-border p-6 shadow-sm hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-950/50 rounded-lg">
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
            <div id="orderStatusChart"></div>
          </div>

          {/* Product Ratings Chart */}
          <div className="bg-card rounded-2xl border border-border p-6 shadow-sm hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-950/50 rounded-lg">
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
            <div id="productRatingsChart"></div>
          </div>

          {/* Brand Distribution Chart */}
          <div className="bg-card rounded-2xl border border-border p-6 shadow-sm hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-950/50 rounded-lg">
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
            <div id="brandChart"></div>
          </div>

          {/* User Locations Chart */}
          <div className="bg-card rounded-2xl border border-border p-6 shadow-sm hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-rose-100 dark:bg-rose-950/50 rounded-lg">
                  <Users className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">
                    مواقع المستخدمين
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    توزيع المستخدمين حسب الموقع
                  </p>
                </div>
              </div>
            </div>
            <div id="locationChart"></div>
          </div>

          {/* Price Ranges Chart */}
          <div className="bg-card rounded-2xl border border-border p-6 shadow-sm hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 dark:bg-amber-950/50 rounded-lg">
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
            <div id="priceChart"></div>
          </div>

          {/* Monthly Sales Chart */}
          <div className="bg-card rounded-2xl border border-border p-6 shadow-sm hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-950/50 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">
                    اتجاه المبيعات الشهرية
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    متابعة المبيعات والطلبات
                  </p>
                </div>
              </div>
            </div>
            <div id="salesChart"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
