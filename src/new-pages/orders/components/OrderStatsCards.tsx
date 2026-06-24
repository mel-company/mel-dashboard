import { Card, CardContent } from "@/components/ui/card";
import { Package, Clock, CheckCircle, XCircle } from "lucide-react";

interface OrderStatsCardsProps {
  stats?: {
    totalOrders?: number;
    pendingOrders?: number;
    completedOrders?: number;
    cancelledOrders?: number;
  };
}

const OrderStatsCards = ({ stats }: OrderStatsCardsProps) => {
  const cards = [
    {
      title: "إجمالي الطلبات",
      value: stats?.totalOrders ?? 0,
      icon: <Package className="size-5" />,
      color: "bg-blue-500",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
    },
    {
      title: "طلبات معلقة",
      value: stats?.pendingOrders ?? 0,
      icon: <Clock className="size-5" />,
      color: "bg-yellow-500",
      bgColor: "bg-yellow-50",
      textColor: "text-yellow-600",
    },
    {
      title: "طلبات مكتملة",
      value: stats?.completedOrders ?? 0,
      icon: <CheckCircle className="size-5" />,
      color: "bg-green-500",
      bgColor: "bg-green-50",
      textColor: "text-green-600",
    },
    {
      title: "طلبات ملغية",
      value: stats?.cancelledOrders ?? 0,
      icon: <XCircle className="size-5" />,
      color: "bg-red-500",
      bgColor: "bg-red-50",
      textColor: "text-red-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <Card key={index} className="overflow-hidden border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </p>
                <p className="text-2xl font-bold">{card.value}</p>
              </div>
              <div className={`rounded-full p-3 ${card.bgColor}`}>
                <div className={card.textColor}>{card.icon}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default OrderStatsCards;
