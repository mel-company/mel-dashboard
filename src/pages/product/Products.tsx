import { useState } from "react";
import { Link } from "react-router-dom";
import { dmy_products } from "@/data/dummy";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, ShoppingCart, Search, Plus } from "lucide-react";

type Props = {};

const Products = ({}: Props) => {
  const [searchQuery, setSearchQuery] = useState("");

  // Filter products based on search query
  const filteredProducts = dmy_products.filter(
    (product) =>
      product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      Object.values(product.properties).some((value) =>
        value.toString().toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  return (
    <div className="space-y-6">
      {/* Search and Add Product Section */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder="ابحث عن منتج..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-right rounded-md border border-input bg-background py-2 pr-10 pl-4 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50 dark:bg-input/30 dark:hover:bg-input/50"
          />
        </div>
        <Button className="gap-2">
          <Plus className="size-4" />
          إضافة منتج
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredProducts.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
            <ShoppingCart className="size-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-foreground">
              لا توجد منتجات
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              {searchQuery
                ? "لم يتم العثور على منتجات تطابق البحث"
                : "ابدأ بإضافة منتج جديد"}
            </p>
          </div>
        ) : (
          filteredProducts.map((product) => (
            <Link key={product.id} to={`/products/${product.id}`}>
              <Card className="group gap-y-0 h-full cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02]">
                <CardHeader className="pb-4">
                  <div className="relative h-40 flex items-center justify-center w-full overflow-hidden rounded-lg bg-dark-blue/10">
                    {/* <img
                    src={product.image}
                    alt={product.title}
                    className="h-full w-full object-cover transition-transform group-hover:scale-110"
                    onError={(e) => {
                      // Fallback to placeholder if image fails to load
                      const target = e.currentTarget;
                      target.src = `https://via.placeholder.com/300x300/cccccc/666666?text=${encodeURIComponent(
                        product.title
                      )}`;
                      target.onerror = null; // Prevent infinite loop
                    }}
                  /> */}
                    <ShoppingCart className="size-18 text-white bg-cyan/40 rounded-full p-4" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <CardTitle className="line-clamp-2 text-right">
                    {product.title}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground line-clamp-2 text-right">
                    {product.description}
                  </p>
                  <div className="flex items-center gap-1">
                    <Star className="size-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{product.rate}</span>
                  </div>
                  <div className="flex mb-2 flex-wrap gap-2">
                    {Object.entries(product.properties).map(([key, value]) => (
                      <Badge key={key} variant="outline" className="text-xs">
                        {value}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="flex items-center justify-between border-t pt-2">
                  <span className="text-lg font-bold text-primary">
                    ${product.price.toFixed(2)}
                  </span>
                  <Badge variant="default" className="px-2 py-1">
                    عرض التفاصيل
                  </Badge>
                </CardFooter>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
};

export default Products;
