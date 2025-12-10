import { useState } from "react";
import { Link } from "react-router-dom";
import { dmy_discounts } from "@/data/dummy";
import { DISCOUNT_STATUS } from "@/utils/constants";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Plus, Tag, Calendar, Package } from "lucide-react";

type Props = {};

const Discounts = ({}: Props) => {
  const [searchQuery, setSearchQuery] = useState("");

  // Filter discounts based on search query
  const filteredDiscounts = dmy_discounts.filter(
    (discount) =>
      discount.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      discount.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get status badge variant and text
  const getStatusBadge = (status: string) => {
    switch (status) {
      case DISCOUNT_STATUS.ACTIVE:
        return {
          className: "bg-green-600 text-white",
          text: "نشط",
        };
      case DISCOUNT_STATUS.INACTIVE:
        return {
          className: "bg-gray-600 text-white",
          text: "غير نشط",
        };
      case DISCOUNT_STATUS.EXPIRED:
        return {
          className: "bg-red-600 text-white",
          text: "منتهي",
        };
      default:
        return {
          className: "bg-gray-600 text-white",
          text: status,
        };
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ar-IQ", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Search and Add Discount Section */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder="ابحث عن خصم..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-right rounded-md border border-input bg-background py-2 pr-10 pl-4 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50 dark:bg-input/30 dark:hover:bg-input/50"
          />
        </div>
        <Button className="gap-2" onClick={() => {}}>
          <Plus className="size-4" />
          إضافة خصم
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredDiscounts.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
            <Tag className="size-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-foreground">
              لا توجد خصومات
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              {searchQuery
                ? "لم يتم العثور على خصومات تطابق البحث"
                : "ابدأ بإضافة خصم جديد"}
            </p>
          </div>
        ) : (
          filteredDiscounts.map((discount) => {
            const statusBadge = getStatusBadge(discount.discount_status);
            return (
              <Link key={discount.id} to={`/discounts/${discount.id}`}>
                <Card className="group gap-y-0 h-full cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02]">
                  <CardHeader className="pb-4">
                    <div className="relative h-32 flex items-center justify-center w-full overflow-hidden rounded-lg bg-gradient-to-br from-primary/20 to-primary/5">
                      <div className="flex flex-col items-center gap-2">
                        <Tag className="size-12 text-primary" />
                        <div className="text-3xl font-bold text-primary">
                          {discount.discount_percentage}%
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <CardTitle className="line-clamp-1 pb-2 text-right text-lg font-semibold">
                      {discount.name}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground line-clamp-2 text-right">
                      {discount.description}
                    </p>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge
                        variant="default"
                        className={`${statusBadge.className} text-sm`}
                      >
                        {statusBadge.text}
                      </Badge>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="size-4" />
                        <span>
                          {formatDate(discount.discount_start_date)} -{" "}
                          {formatDate(discount.discount_end_date)}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Package className="size-4" />
                          <span>{discount.discount_products.length} منتج</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Tag className="size-4" />
                          <span>{discount.discount_categories.length} فئة</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex items-center justify-end border-t pt-2">
                    <Badge variant="default" className="px-2 py-1">
                      عرض التفاصيل
                    </Badge>
                  </CardFooter>
                </Card>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Discounts;
