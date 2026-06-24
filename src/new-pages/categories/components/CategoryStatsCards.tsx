import { Card, CardContent } from "@/components/ui/card";
import { Folder, TrendingUp, Package, Star } from "lucide-react";

interface CategoryStatsCardsProps {
  stats?: {
    totalCategories?: number;
    activeCategories?: number;
    totalProducts?: number;
    featuredCategories?: number;
  };
}

const CategoryStatsCards = ({ stats }: CategoryStatsCardsProps) => {
  const cards = [
    {
      title: "إجمالي الفئات",
      value: stats?.totalCategories ?? 0,
      icon: <Folder className="size-5" />,
      color: "bg-blue-500",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
    },
    {
      title: "فئات نشطة",
      value: stats?.activeCategories ?? 0,
      icon: <TrendingUp className="size-5" />,
      color: "bg-green-500",
      bgColor: "bg-green-50",
      textColor: "text-green-600",
    },
    {
      title: "إجمالي المنتجات",
      value: stats?.totalProducts ?? 0,
      icon: <Package className="size-5" />,
      color: "bg-purple-500",
      bgColor: "bg-purple-50",
      textColor: "text-purple-600",
    },
    {
      title: "فئات مميزة",
      value: stats?.featuredCategories ?? 0,
      icon: <Star className="size-5" />,
      color: "bg-orange-500",
      bgColor: "bg-orange-50",
      textColor: "text-orange-600",
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

export default CategoryStatsCards;
