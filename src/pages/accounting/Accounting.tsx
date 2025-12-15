import { useState } from "react";
import { Plus, Search, Filter, Download, TrendingUp, TrendingDown, DollarSign, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const Accounting = () => {
  const [searchQuery, setSearchQuery] = useState("");

  // Dummy data
  const stats = [
    {
      label: "إجمالي الإيرادات",
      value: "125,000",
      currency: "دينار",
      change: "+12.5%",
      trend: "up",
      icon: TrendingUp,
      gradient: "from-green-500 to-green-600",
    },
    {
      label: "إجمالي المصروفات",
      value: "85,000",
      currency: "دينار",
      change: "+8.2%",
      trend: "up",
      icon: TrendingDown,
      gradient: "from-red-500 to-red-600",
    },
    {
      label: "صافي الربح",
      value: "40,000",
      currency: "دينار",
      change: "+18.3%",
      trend: "up",
      icon: DollarSign,
      gradient: "from-blue-500 to-blue-600",
    },
    {
      label: "الفواتير المعلقة",
      value: "15",
      change: "-3",
      trend: "down",
      icon: Receipt,
      gradient: "from-orange-500 to-orange-600",
    },
  ];

  const transactions = [
    {
      id: "1",
      type: "إيراد",
      description: "فاتورة مبيعات #1234",
      amount: 5000,
      date: "2024-01-15",
      status: "مكتمل",
    },
    {
      id: "2",
      type: "مصروف",
      description: "فاتورة شراء #5678",
      amount: 2500,
      date: "2024-01-14",
      status: "مكتمل",
    },
    {
      id: "3",
      type: "إيراد",
      description: "فاتورة مبيعات #1235",
      amount: 8000,
      date: "2024-01-13",
      status: "معلق",
    },
    {
      id: "4",
      type: "مصروف",
      description: "راتب موظفين",
      amount: 12000,
      date: "2024-01-12",
      status: "مكتمل",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
              المحاسبة
            </h1>
            <p className="text-muted-foreground text-sm">
              إدارة الحسابات المالية والفواتير
            </p>
          </div>
          <Button>
            <Plus className="w-4 h-4 ml-2" />
            إضافة معاملة
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card
                key={stat.label}
                className={cn(
                  "p-6 border border-border bg-card",
                  "hover:shadow-lg transition-shadow"
                )}
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={cn(
                      "w-12 h-12 rounded-lg flex items-center justify-center",
                      "bg-gradient-to-br",
                      stat.gradient,
                      "shadow-md"
                    )}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <Badge
                    variant={
                      stat.trend === "up" ? "default" : "destructive"
                    }
                    className="text-xs"
                  >
                    {stat.change}
                  </Badge>
                </div>
                <h3 className="text-sm text-muted-foreground mb-1">
                  {stat.label}
                </h3>
                <p className="text-2xl font-bold text-foreground">
                  {stat.value}{" "}
                  {stat.currency && (
                    <span className="text-sm text-muted-foreground">
                      {stat.currency}
                    </span>
                  )}
                </p>
              </Card>
            );
          })}
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              type="text"
              placeholder="ابحث في المعاملات..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10"
              dir="rtl"
            />
          </div>
          <Button variant="outline">
            <Filter className="w-4 h-4 ml-2" />
            تصفية
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 ml-2" />
            تصدير
          </Button>
        </div>

        {/* Transactions Table */}
        <Card className="border border-border bg-card">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              المعاملات الأخيرة
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-right py-3 px-4 text-sm font-semibold text-foreground">
                      النوع
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-foreground">
                      الوصف
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-foreground">
                      المبلغ
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-foreground">
                      التاريخ
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-foreground">
                      الحالة
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction) => (
                    <tr
                      key={transaction.id}
                      className="border-b border-border hover:bg-accent transition-colors"
                    >
                      <td className="py-3 px-4">
                        <Badge
                          variant={
                            transaction.type === "إيراد"
                              ? "default"
                              : "destructive"
                          }
                          className="text-xs"
                        >
                          {transaction.type}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-sm text-foreground">
                        {transaction.description}
                      </td>
                      <td
                        className={cn(
                          "py-3 px-4 text-sm font-medium",
                          transaction.type === "إيراد"
                            ? "text-green-600 dark:text-green-400"
                            : "text-red-600 dark:text-red-400"
                        )}
                      >
                        {transaction.type === "إيراد" ? "+" : "-"}
                        {transaction.amount.toLocaleString()} دينار
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">
                        {transaction.date}
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={
                            transaction.status === "مكتمل"
                              ? "default"
                              : "secondary"
                          }
                          className="text-xs"
                        >
                          {transaction.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Accounting;

