import { useState } from "react";
import { Link } from "react-router-dom";
import { dmy_categories } from "@/data/dummy";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Plus, Folder, CheckCircle2 } from "lucide-react";
import AddCategoryDialog from "@/components/dialogs/AddCategoryDialog";

type Props = {};

interface Category {
  id: number;
  name: string;
  description: string;
  enabled: boolean;
  number_of_products: number;
  image: string;
}

const Categories = ({}: Props) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState<Category[]>(dmy_categories);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Filter categories based on search query
  const filteredCategories = categories.filter(
    (category) =>
      category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle adding new category
  const handleAddCategory = (
    categoryData: Omit<Category, "id" | "number_of_products">
  ) => {
    const newCategory: Category = {
      id:
        categories.length > 0
          ? Math.max(...categories.map((c) => c.id)) + 1
          : 1,
      ...categoryData,
      number_of_products: 0,
    };
    setCategories([...categories, newCategory]);
  };

  return (
    <div className="space-y-6">
      {/* Search and Add Category Section */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-full sm:max-w-md">
          <Search className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder="ابحث عن فئة..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-right rounded-md border border-input bg-background py-2 pr-10 pl-4 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50 dark:bg-input/30 dark:hover:bg-input/50"
          />
        </div>
        <Button className="gap-2 w-full sm:w-auto" onClick={() => setIsDialogOpen(true)}>
          <Plus className="size-4" />
          <span className="hidden sm:inline">إضافة فئة</span>
          <span className="sm:hidden">إضافة</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredCategories.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
            <Folder className="size-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-foreground">لا توجد فئات</p>
            <p className="text-sm text-muted-foreground mt-2">
              {searchQuery
                ? "لم يتم العثور على فئات تطابق البحث"
                : "ابدأ بإضافة فئة جديدة"}
            </p>
          </div>
        ) : (
          filteredCategories.map((category) => (
            <Link key={category.id} to={`/categories/${category.id}`}>
              <Card className="group gap-y-0 h-full cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02]">
                <CardHeader className="pb-4">
                  <div className="relative h-40 flex items-center justify-center w-full overflow-hidden rounded-lg bg-dark-blue/10">
                    {/* <img
                      src={category.image}
                      alt={category.name}
                      className="h-full w-full object-cover transition-transform group-hover:scale-110"
                      onError={(e) => {
                        // Fallback to placeholder if image fails to load
                        const target = e.currentTarget;
                        target.src = `https://via.placeholder.com/300x300/cccccc/666666?text=${encodeURIComponent(
                          category.name
                        )}`;
                        target.onerror = null; // Prevent infinite loop
                      }}
                    /> */}
                    <Folder className="size-18 text-white bg-cyan/40 rounded-full p-4" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <CardTitle className="line-clamp-1 pb-2 text-right text-lg font-semibold">
                    {category.name}
                  </CardTitle>
                  <p className="text-md text-muted-foreground line-clamp-3 text-right">
                    {category.description}
                  </p>
                  <div className="mb-2 flex items-center gap-2">
                    {category.enabled ? (
                      <Badge
                        variant="default"
                        className="bg-green-600 gap-1 text-sm"
                      >
                        <CheckCircle2 className="size-3" />
                        مفعّل
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="text-sm bg-red-600 text-white"
                      >
                        معطّل
                      </Badge>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex items-center justify-between border-t pt-2">
                  <div>
                    <span className="text-md text-muted-foreground">
                      عدد المنتجات: {category.number_of_products}
                    </span>
                  </div>
                  <Badge variant="default" className="px-2 py-1">
                    عرض التفاصيل
                  </Badge>
                </CardFooter>
              </Card>
            </Link>
          ))
        )}
      </div>

      {/* Add Category Dialog */}
      <AddCategoryDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onAddCategory={handleAddCategory}
      />
    </div>
  );
};

export default Categories;
