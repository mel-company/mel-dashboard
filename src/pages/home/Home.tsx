import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Package, Layers, Tag, Users, Edit, Store } from 'lucide-react';

// Declare ApexCharts globally
declare global {
  interface Window {
    ApexCharts: any;
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
  { title: "Laptop Pro 15", rate: 4.5, price: 899, properties: { brand: "TechCorp" } },
  { title: "Wireless Mouse", rate: 4.2, price: 25, properties: { brand: "Logitech" } },
  { title: "Mechanical Keyboard", rate: 4.8, price: 120, properties: { brand: "Corsair" } },
  { title: "USB-C Hub", rate: 4.0, price: 45, properties: { brand: "Anker" } },
  { title: "Monitor 27 inch", rate: 4.6, price: 350, properties: { brand: "Dell" } },
  { title: "Webcam HD", rate: 3.9, price: 65, properties: { brand: "Logitech" } },
  { title: "Desk Lamp", rate: 4.3, price: 35, properties: { brand: "IKEA" } },
  { title: "Gaming Headset", rate: 4.7, price: 85, properties: { brand: "Corsair" } },
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

  useEffect(() => {
    // Load ApexCharts
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/apexcharts/3.45.1/apexcharts.min.js';
    script.async = true;
    script.onload = initCharts;
    document.body.appendChild(script);

    return () => {
      // Cleanup charts
      const chartElements = document.querySelectorAll('[id$="Chart"]');
      chartElements.forEach(element => {
        const chart = (element as any)._chart;
        chart?.destroy?.();
      });
    };
  }, []);

  const initCharts = () => {
    // Clear any existing charts first
    const chartIds = [
      '#orderStatusChart', '#productRatingsChart', '#brandChart', 
      '#locationChart', '#salesChart', '#priceChart', '#roleChart',
      '#discountChart', '#timelineChart', '#heatmapChart'
    ];
    
    chartIds.forEach(id => {
      const element = document.querySelector(id);
      if (element) {
        element.innerHTML = '';
      }
    });

    // Order Status Chart
    const orderStatusData = [
      { status: "Pending", count: dmy_orders.filter(o => o.status === "pending").length },
      { status: "Processing", count: dmy_orders.filter(o => o.status === "processing").length },
      { status: "Shipped", count: dmy_orders.filter(o => o.status === "shipped").length },
      { status: "Delivered", count: dmy_orders.filter(o => o.status === "delivered").length },
    ];

    const orderChart = new (window as any).ApexCharts(document.querySelector("#orderStatusChart"), {
      series: [{
        name: 'Orders',
        data: orderStatusData.map(d => d.count)
      }],
      chart: {
        type: 'bar',
        height: 300,
        toolbar: { show: false },
        fontFamily: 'inherit',
      },
      colors: ['#3b82f6'],
      plotOptions: {
        bar: {
          borderRadius: 8,
          columnWidth: '60%',
          dataLabels: { position: 'top' }
        }
      },
      dataLabels: {
        enabled: true,
        offsetY: -25,
        style: { fontSize: '12px', colors: ["#6b7280"] }
      },
      xaxis: {
        categories: orderStatusData.map(d => d.status),
        labels: { style: { colors: '#6b7280', fontSize: '12px' } }
      },
      yaxis: {
        labels: { style: { colors: '#6b7280', fontSize: '12px' } }
      },
      grid: {
        borderColor: '#e5e7eb',
        strokeDashArray: 3,
      },
    });
    orderChart.render();

    // Product Ratings Chart
    const productData = dmy_products.slice(0, 6).map(p => ({
      name: p.title.split(" ").slice(0, 2).join(" "),
      rating: p.rate,
      price: p.price
    }));

    const ratingChart = new (window as any).ApexCharts(document.querySelector("#productRatingsChart"), {
      series: [
        { name: 'Rating', type: 'column', data: productData.map(p => p.rating) },
        { name: 'Price', type: 'line', data: productData.map(p => p.price) }
      ],
      chart: {
        height: 300,
        type: 'line',
        toolbar: { show: false },
        fontFamily: 'inherit',
      },
      colors: ['#10b981', '#f59e0b'],
      stroke: { width: [0, 3], curve: 'smooth' },
      plotOptions: {
        bar: { borderRadius: 6, columnWidth: '50%' }
      },
      dataLabels: { enabled: false },
      xaxis: {
        categories: productData.map(p => p.name),
        labels: { 
          rotate: -45,
          style: { colors: '#6b7280', fontSize: '11px' } 
        }
      },
      yaxis: [
        {
          title: { text: 'Rating', style: { color: '#10b981' } },
          labels: { style: { colors: '#6b7280' } }
        },
        {
          opposite: true,
          title: { text: 'Price ($)', style: { color: '#f59e0b' } },
          labels: { style: { colors: '#6b7280' } }
        }
      ],
      legend: { position: 'top', horizontalAlign: 'left' },
      grid: { borderColor: '#e5e7eb', strokeDashArray: 3 },
    });
    ratingChart.render();

    // Brand Distribution Donut
    const brandData: any[] = dmy_products.reduce((acc: any[], product) => {
      const brand = product.properties.brand;
      const existing = acc.find(item => item.brand === brand);
      if (existing) existing.count++;
      else acc.push({ brand, count: 1 });
      return acc;
    }, []);

    const brandChart = new (window as any).ApexCharts(document.querySelector("#brandChart"), {
      series: brandData.map(d => d.count),
      chart: { type: 'donut', height: 280, fontFamily: 'inherit' },
      labels: brandData.map(d => d.brand),
      colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'],
      plotOptions: {
        pie: {
          donut: {
            size: '65%',
            labels: {
              show: true,
              total: {
                show: true,
                label: 'Total Products',
                formatter: () => dmy_products.length
              }
            }
          }
        }
      },
      legend: { position: 'bottom' },
      dataLabels: {
        formatter: (val: any) => Math.round(val) + '%'
      }
    });
    brandChart.render();

    // User Locations Radial
    const locationData: any[] = dmy_users.reduce((acc: any[], user) => {
      const location = user.location.split(",")[0];
      const existing = acc.find(item => item.location === location);
      if (existing) existing.users++;
      else acc.push({ location, users: 1 });
      return acc;
    }, []);

    const locationChart = new (window as any).ApexCharts(document.querySelector("#locationChart"), {
      series: locationData.map(d => (d.users / dmy_users.length) * 100),
      chart: { type: 'radialBar', height: 300, fontFamily: 'inherit' },
      plotOptions: {
        radialBar: {
          offsetY: 0,
          startAngle: 0,
          endAngle: 270,
          hollow: { margin: 5, size: '30%', background: 'transparent' },
          dataLabels: {
            name: { fontSize: '14px' },
            value: { fontSize: '16px', formatter: (val: any) => Math.round(val) + '%' }
          }
        }
      },
      colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'],
      labels: locationData.map(d => d.location),
      legend: { show: true, position: 'bottom' }
    });
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

    const salesChart = new (window as any).ApexCharts(document.querySelector("#salesChart"), {
      series: [
        { name: 'Sales ($)', data: monthlySalesData.map(d => d.sales) },
        { name: 'Orders', data: monthlySalesData.map(d => d.orders * 100) }
      ],
      chart: {
        type: 'area',
        height: 300,
        toolbar: { show: false },
        fontFamily: 'inherit',
      },
      colors: ['#3b82f6', '#10b981'],
      dataLabels: { enabled: false },
      stroke: { curve: 'smooth', width: 2 },
      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.5,
          opacityTo: 0.1,
        }
      },
      xaxis: {
        categories: monthlySalesData.map(d => d.month),
        labels: { style: { colors: '#6b7280' } }
      },
      yaxis: {
        labels: { style: { colors: '#6b7280' } }
      },
      legend: { position: 'top', horizontalAlign: 'left' },
      grid: { borderColor: '#e5e7eb', strokeDashArray: 3 },
      tooltip: {
        y: {
          formatter: (val: any, { seriesIndex }: any) => 
            seriesIndex === 0 ? '$' + val : Math.round(val / 100) + ' orders'
        }
      }
    });
    salesChart.render();

    // Price Range Polar Chart
    const priceRangeData = [
      { range: "$0-25", count: dmy_products.filter(p => p.price <= 25).length },
      { range: "$26-50", count: dmy_products.filter(p => p.price > 25 && p.price <= 50).length },
      { range: "$51-75", count: dmy_products.filter(p => p.price > 50 && p.price <= 75).length },
      { range: "$76+", count: dmy_products.filter(p => p.price > 75).length },
    ];

    const priceChart = new (window as any).ApexCharts(document.querySelector("#priceChart"), {
      series: priceRangeData.map(d => d.count),
      chart: { type: 'polarArea', height: 300, fontFamily: 'inherit' },
      labels: priceRangeData.map(d => d.range),
      colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'],
      stroke: { colors: ['#fff'] },
      fill: { opacity: 0.8 },
      legend: { position: 'bottom' },
      plotOptions: {
        polarArea: {
          rings: { strokeWidth: 1, strokeColor: '#e5e7eb' },
          spokes: { strokeWidth: 1, strokeColor: '#e5e7eb' }
        }
      }
    });
    priceChart.render();
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            Dashboard Analytics
          </h1>
          <p className="text-slate-600">Overview of your business metrics</p>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <div className="flex gap-4 flex-wrap">
            <button
              onClick={() => navigate('/editor/templates')}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <Store className="w-5 h-5" />
              معرض القوالب
            </button>
            <button
              onClick={() => navigate('/editor/templates')}
              className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <Edit className="w-5 h-5" />
              محرر القوالب
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <p className="text-slate-600 text-sm mb-1">Total Orders</p>
            <p className="text-3xl font-bold text-slate-800">{dmy_orders.length}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <Package className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <p className="text-slate-600 text-sm mb-1">Products</p>
            <p className="text-3xl font-bold text-slate-800">{dmy_products.length}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Layers className="w-5 h-5 text-amber-600" />
              </div>
            </div>
            <p className="text-slate-600 text-sm mb-1">Categories</p>
            <p className="text-3xl font-bold text-slate-800">{dmy_categories.length}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Tag className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <p className="text-slate-600 text-sm mb-1">Active Discounts</p>
            <p className="text-3xl font-bold text-slate-800">
              {dmy_discounts.filter((d: { discount_status: string }) => d.discount_status === 'ACTIVE').length}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-rose-100 rounded-lg">
                <Users className="w-5 h-5 text-rose-600" />
              </div>
            </div>
            <p className="text-slate-600 text-sm mb-1">Total Users</p>
            <p className="text-3xl font-bold text-slate-800">{dmy_users.length}</p>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Order Status</h3>
            <div id="orderStatusChart"></div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Product Ratings & Prices</h3>
            <div id="productRatingsChart"></div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Brand Distribution</h3>
            <div id="brandChart"></div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">User Locations</h3>
            <div id="locationChart"></div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Price Ranges</h3>
            <div id="priceChart"></div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Monthly Sales Trend</h3>
            <div id="salesChart"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;