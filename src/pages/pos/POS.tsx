import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Package,
} from "lucide-react";

// Dummy data types
type Product = {
  id: string;
  name: string;
  price: number;
  image?: string;
  category: string;
  description?: string;
  options: {
    name: string;
    values: string[];
  }[];
  variants: {
    id: string;
    sku: string;
    qr_code: string;
    price: number;
    stock: number;
    image?: string;
    optionValues: {
      label: string;
      value: string;
    }[];
  }[];
};

type CartItem = {
  product: Product;
  variant?: Product["variants"][0];
  selectedOptions: Record<string, string>; // option name -> selected value
  quantity: number;
};

// Dummy data
const categories = [
  "الكل",
  "إلكترونيات",
  "ملابس",
  "أطعمة",
  "أثاث",
  "كتب",
  "ألعاب",
];

const dummyProducts: Product[] = [
  {
    id: "1",
    name: "هاتف ذكي",
    price: 250000,
    category: "إلكترونيات",
    description: "هاتف ذكي بمواصفات عالية",
    options: [
      {
        name: "اللون",
        values: ["احمر", "ابيض", "ازرق"],
      },
      {
        name: "الحجم",
        values: ["S", "M", "L"],
      },
    ],
    variants: [
      {
        id: "1",
        sku: "1234567890",
        qr_code: "1234567890",
        price: 250000,
        stock: 10,
        optionValues: [
          {
            label: "احمر",
            value: "احمر",
          },
        ],
      },
    ],
  },
  {
    id: "2",
    name: "قميص قطني",
    price: 35000,
    category: "ملابس",
    description: "قميص قطني مريح",
    options: [
      {
        name: "اللون",
        values: ["احمر", "ابيض", "ازرق"],
      },
      {
        name: "الحجم",
        values: ["S", "M", "L"],
      },
    ],
    variants: [
      {
        id: "2",
        sku: "1234567890",
        qr_code: "1234567890",
        price: 35000,
        stock: 10,
        optionValues: [
          {
            label: "احمر",
            value: "احمر",
          },
        ],
      },
      {
        id: "3",
        sku: "1234567890",
        qr_code: "1234567890",
        price: 35000,
        stock: 10,
        optionValues: [
          {
            label: "ابيض",
            value: "ابيض",
          },
          {
            label: "ازرق",
            value: "ازرق",
          },
        ],
      },
    ],
  },
  {
    id: "3",
    name: "بيتزا",
    price: 15000,
    category: "أطعمة",
    description: "بيتزا إيطالية لذيذة",
    options: [
      {
        name: "اللون",
        values: ["احمر", "ابيض", "ازرق"],
      },
      {
        name: "الحجم",
        values: ["S", "M", "L"],
      },
    ],
    variants: [
      {
        id: "4",
        sku: "1234567890",
        qr_code: "1234567890",
        price: 15000,
        stock: 10,
        optionValues: [
          {
            label: "احمر",
            value: "احمر",
          },
        ],
      },
    ],
  },
  {
    id: "4",
    name: "طاولة خشبية",
    price: 120000,
    category: "أثاث",
    description: "طاولة خشبية عالية الجودة",
    options: [
      {
        name: "اللون",
        values: ["احمر", "ابيض", "ازرق"],
      },
      {
        name: "الحجم",
        values: ["S", "M", "L"],
      },
    ],
    variants: [
      {
        id: "5",
        sku: "1234567890",
        qr_code: "1234567890",
        price: 120000,
        stock: 10,
        optionValues: [
          {
            label: "احمر",
            value: "احمر",
          },
        ],
      },
    ],
  },
  {
    id: "5",
    name: "رواية",
    price: 15000,
    category: "كتب",
    description: "رواية أدبية",
    options: [
      {
        name: "اللون",
        values: ["احمر", "ابيض", "ازرق"],
      },
      {
        name: "الحجم",
        values: ["S", "M", "L"],
      },
    ],
    variants: [
      {
        id: "6",
        sku: "1234567890",
        qr_code: "1234567890",
        price: 15000,
        stock: 10,
        optionValues: [
          {
            label: "احمر",
            value: "احمر",
          },
        ],
      },
    ],
  },
  {
    id: "6",
    name: "لعبة أطفال",
    price: 25000,
    category: "ألعاب",
    description: "لعبة تعليمية للأطفال",
    options: [
      {
        name: "اللون",
        values: ["احمر", "ابيض", "ازرق"],
      },
      {
        name: "الحجم",
        values: ["S", "M", "L"],
      },
    ],
    variants: [
      {
        id: "7",
        sku: "1234567890",
        qr_code: "1234567890",
        price: 25000,
        stock: 10,
        optionValues: [
          {
            label: "احمر",
            value: "احمر",
          },
        ],
      },
    ],
  },
  {
    id: "7",
    name: "ساعة ذكية",
    price: 180000,
    category: "إلكترونيات",
    description: "ساعة ذكية متطورة",
    options: [
      {
        name: "اللون",
        values: ["احمر", "ابيض", "ازرق"],
      },
      {
        name: "الحجم",
        values: ["S", "M", "L"],
      },
    ],
    variants: [
      {
        id: "8",
        sku: "1234567890",
        qr_code: "1234567890",
        price: 180000,
        stock: 10,
        optionValues: [
          {
            label: "احمر",
            value: "احمر",
          },
        ],
      },
    ],
  },
  {
    id: "8",
    name: "بنطلون جينز",
    price: 45000,
    category: "ملابس",
    description: "بنطلون جينز كلاسيكي",
    options: [
      {
        name: "اللون",
        values: ["احمر", "ابيض", "ازرق"],
      },
      {
        name: "الحجم",
        values: ["S", "M", "L"],
      },
    ],
    variants: [
      {
        id: "9",
        sku: "1234567890",
        qr_code: "1234567890",
        price: 45000,
        stock: 10,
        optionValues: [
          {
            label: "احمر",
            value: "احمر",
          },
        ],
      },
    ],
  },
];

type Props = {};

const POS = ({}: Props) => {
  const [selectedCategory, setSelectedCategory] = useState("الكل");
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isOptionDialogOpen, setIsOptionDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, string>
  >({});

  // Filter products
  const filteredProducts = dummyProducts.filter((product) => {
    const matchesCategory =
      selectedCategory === "الكل" || product.category === selectedCategory;
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Find matching variant based on selected options
  const findMatchingVariant = (
    product: Product,
    options: Record<string, string>
  ) => {
    if (!product.variants || product.variants.length === 0) return null;

    return product.variants.find((variant) => {
      const variantOptionValues = variant.optionValues.map((ov) => ov.value);
      const selectedValues = Object.values(options);

      // Check if all selected values match the variant's option values
      return (
        selectedValues.length === variantOptionValues.length &&
        selectedValues.every((val) => variantOptionValues.includes(val))
      );
    });
  };

  // Handle product selection - show dialog if has options
  const handleProductClick = (product: Product) => {
    if (product.options && product.options.length > 0) {
      setSelectedProduct(product);
      setSelectedOptions({});
      setIsOptionDialogOpen(true);
    } else {
      // No options, add directly to cart
      addToCart(product, undefined, {});
    }
  };

  // Add product to cart with variant and options
  const addToCart = (
    product: Product,
    variant: Product["variants"][0] | undefined,
    options: Record<string, string>
  ) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => {
        if (variant) {
          return (
            item.variant?.id === variant.id && item.product.id === product.id
          );
        }
        return item.product.id === product.id && !item.variant;
      });

      if (existingItem) {
        return prevCart.map((item) =>
          item === existingItem
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [
        ...prevCart,
        {
          product,
          variant,
          selectedOptions: options,
          quantity: 1,
        },
      ];
    });
  };

  // Handle option selection in dialog
  const handleOptionSelect = (optionName: string, value: string) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [optionName]: value,
    }));
  };

  // Confirm adding product with selected options
  const handleConfirmAddToCart = () => {
    if (!selectedProduct) return;

    const variant = findMatchingVariant(selectedProduct, selectedOptions);
    addToCart(selectedProduct, variant || undefined, selectedOptions);

    setIsOptionDialogOpen(false);
    setSelectedProduct(null);
    setSelectedOptions({});
  };

  // Check if all required options are selected
  const canAddToCart = () => {
    if (!selectedProduct) return false;
    if (!selectedProduct.options || selectedProduct.options.length === 0)
      return true;

    return (
      selectedProduct.options.every((option) => selectedOptions[option.name]) &&
      findMatchingVariant(selectedProduct, selectedOptions) !== undefined
    );
  };

  // Update quantity
  const updateQuantity = (itemIndex: number, delta: number) => {
    setCart((prevCart) => {
      const item = prevCart[itemIndex];
      if (!item) return prevCart;

      const newQuantity = item.quantity + delta;
      if (newQuantity <= 0) {
        return prevCart.filter((_, index) => index !== itemIndex);
      }

      return prevCart.map((cartItem, index) =>
        index === itemIndex ? { ...cartItem, quantity: newQuantity } : cartItem
      );
    });
  };

  // Remove from cart
  const removeFromCart = (itemIndex: number) => {
    setCart((prevCart) => prevCart.filter((_, index) => index !== itemIndex));
  };

  // Calculate total
  const calculateTotal = () => {
    return cart.reduce((total, item) => {
      const price = item.variant?.price ?? item.product.price;
      return total + price * item.quantity;
    }, 0);
  };

  const total = calculateTotal();

  return (
    <div className="h-[calc(100vh-4rem)] flex gap-4 p-4">
      {/* Left Side - Products */}
      <div className="flex-1 flex flex-col gap-4 overflow-hidden">
        {/* Search and Categories */}
        <Card>
          <CardContent className="space-y-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground size-4" />
              <Input
                placeholder="ابحث عن منتج..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10 text-right"
              />
            </div>

            {/* Categories */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Badge
                  key={category}
                  variant={
                    selectedCategory === category ? "default" : "secondary"
                  }
                  className="cursor-pointer px-4 py-2 text-sm"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Products Grid */}
        <Card className="flex-1 overflow-hidden flex flex-col">
          <CardHeader>
            <CardTitle className="text-right flex items-center gap-2">
              <Package className="size-5" />
              المنتجات ({filteredProducts.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto">
            {filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <Package className="size-16 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">لا توجد منتجات متاحة</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredProducts.map((product) => (
                  <Card
                    key={product.id}
                    className="hover:shadow-lg transition-shadow cursor-pointer group"
                  >
                    <CardContent className="p-4">
                      {/* Product Image Placeholder */}
                      <div className="w-full h-32 bg-muted rounded-lg mb-3 flex items-center justify-center">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <Package className="size-12 text-muted-foreground" />
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="space-y-2">
                        <h3 className="font-semibold text-right line-clamp-1">
                          {product.name}
                        </h3>
                        {product.description && (
                          <p className="text-sm text-muted-foreground text-right line-clamp-2">
                            {product.description}
                          </p>
                        )}
                        <div className="flex items-center justify-between">
                          <Badge variant="secondary" className="text-xs">
                            {product.category}
                          </Badge>
                          <span className="font-bold text-primary">
                            {product.price.toLocaleString()} د.ع
                          </span>
                        </div>
                      </div>

                      {/* Add to Cart Button */}
                      <Button
                        className="w-full mt-3 gap-2"
                        onClick={() => handleProductClick(product)}
                        variant="secondary"
                      >
                        <Plus className="size-4" />
                        إضافة للسلة
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Right Side - Cart */}
      <div className="w-96 flex flex-col gap-4 overflow-hidden">
        <Card className="flex-1 flex flex-col overflow-hidden">
          <CardHeader>
            <CardTitle className="text-right flex items-center gap-2">
              <ShoppingCart className="size-5" />
              السلة ({cart.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto space-y-4">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <ShoppingCart className="size-16 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">السلة فارغة</p>
                <p className="text-sm text-muted-foreground mt-2">
                  أضف منتجات من القائمة
                </p>
              </div>
            ) : (
              <>
                {cart.map((item, index) => {
                  const price = item.variant?.price ?? item.product.price;
                  const image = item.variant?.image ?? item.product.image;
                  return (
                    <div
                      key={`${item.product.id}-${
                        item.variant?.id ?? "default"
                      }-${index}`}
                      className="border rounded-lg p-4 space-y-3"
                    >
                      <div className="flex items-start gap-3">
                        {/* Product Image */}
                        <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center shrink-0">
                          {image ? (
                            <img
                              src={image}
                              alt={item.product.name}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <Package className="size-8 text-muted-foreground" />
                          )}
                        </div>

                        {/* Product Details */}
                        <div className="flex-1 text-right">
                          <h4 className="font-semibold">{item.product.name}</h4>
                          {Object.keys(item.selectedOptions).length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {Object.entries(item.selectedOptions).map(
                                ([optionName, value]) => (
                                  <Badge
                                    key={optionName}
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    {optionName}: {value}
                                  </Badge>
                                )
                              )}
                            </div>
                          )}
                          <p className="text-sm text-muted-foreground mt-1">
                            {price.toLocaleString()} د.ع
                          </p>
                        </div>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center justify-between">
                        <Button
                          variant="secondary"
                          size="icon"
                          onClick={() => removeFromCart(index)}
                          className="h-8 w-8"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                        <div className="flex items-center gap-3">
                          <Button
                            variant="secondary"
                            size="icon"
                            onClick={() => updateQuantity(index, -1)}
                            className="h-8 w-8"
                          >
                            <Minus className="size-4" />
                          </Button>
                          <span className="font-semibold w-8 text-center">
                            {item.quantity}
                          </span>
                          <Button
                            variant="secondary"
                            size="icon"
                            onClick={() => updateQuantity(index, 1)}
                            className="h-8 w-8"
                          >
                            <Plus className="size-4" />
                          </Button>
                        </div>
                        <span className="font-bold text-primary">
                          {(price * item.quantity).toLocaleString()} د.ع
                        </span>
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </CardContent>
        </Card>

        {/* Cart Summary */}
        {cart.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-right">الملخص</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">عدد العناصر:</span>
                <span className="font-semibold">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">المجموع:</span>
                <span className="text-2xl font-bold text-primary">
                  {total.toLocaleString()} د.ع
                </span>
              </div>
              <Button className="w-full" size="lg">
                إتمام الطلب
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Option Selection Dialog */}
      <Dialog open={isOptionDialogOpen} onOpenChange={setIsOptionDialogOpen}>
        <DialogContent className="max-w-md text-right">
          <DialogHeader>
            <DialogTitle>{selectedProduct?.name}</DialogTitle>
          </DialogHeader>

          {selectedProduct && (
            <div className="space-y-4 py-4">
              {selectedProduct.options?.map((option) => (
                <div key={option.name} className="space-y-2">
                  <label className="text-sm font-medium">{option.name}</label>
                  <div className="flex flex-wrap gap-2">
                    {option.values.map((value) => {
                      const isSelected = selectedOptions[option.name] === value;
                      return (
                        <Button
                          key={value}
                          type="button"
                          variant={isSelected ? "default" : "secondary"}
                          size="sm"
                          onClick={() => handleOptionSelect(option.name, value)}
                          className="min-w-[80px]"
                        >
                          {value}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Show selected variant price */}
              {canAddToCart() && (
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      السعر:
                    </span>
                    <span className="text-lg font-bold text-primary">
                      {(
                        findMatchingVariant(selectedProduct, selectedOptions)
                          ?.price ?? selectedProduct.price
                      ).toLocaleString()}{" "}
                      د.ع
                    </span>
                  </div>
                  {findMatchingVariant(selectedProduct, selectedOptions)
                    ?.stock !== undefined && (
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm text-muted-foreground">
                        المخزون:
                      </span>
                      <span className="text-sm font-medium">
                        {
                          findMatchingVariant(selectedProduct, selectedOptions)
                            ?.stock
                        }{" "}
                        قطعة
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => {
                setIsOptionDialogOpen(false);
                setSelectedProduct(null);
                setSelectedOptions({});
              }}
            >
              إلغاء
            </Button>
            <Button
              onClick={handleConfirmAddToCart}
              //  disabled={!canAddToCart()}
            >
              إضافة للسلة
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default POS;
