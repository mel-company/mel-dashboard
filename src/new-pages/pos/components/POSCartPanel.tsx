import { Loader2, Minus, Package, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import type { CartItem } from "../utils";
import { formatPosPrice, resolvePosImageUrl } from "../utils";

type POSCartPanelProps = {
  cart: CartItem[];
  baseUrl: string;
  total: number;
  orderId: string | null;
  isAddingProducts: boolean;
  onCheckout: () => void;
  onUpdateQuantity: (index: number, delta: number) => void;
  onRemove: (index: number) => void;
};

const POSCartPanel = ({
  cart,
  baseUrl,
  total,
  orderId,
  isAddingProducts,
  onCheckout,
  onUpdateQuantity,
  onRemove,
}: POSCartPanelProps) => {
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-3xl bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div className="flex items-center gap-2">
            <div className="flex size-10 items-center justify-center rounded-full bg-sky-50 text-sky-600">
              <ShoppingCart className="size-5" />
            </div>
            <div className="text-right">
              <h2 className="text-lg font-bold text-blue-950">سلة المشتريات</h2>
              <p className="text-xs text-muted-foreground">راجع العناصر قبل الإتمام</p>
            </div>
          </div>
          <span className="rounded-full bg-sky-100 px-3 py-1 text-sm font-semibold text-sky-700 tabular-nums">
            {itemCount}
          </span>
        </div>

        <div className="custom-scrollbar flex-1 space-y-3 overflow-y-auto p-4">
          {cart.length === 0 ? (
            <div className="flex h-full min-h-[280px] flex-col items-center justify-center text-center">
              <ShoppingCart className="mb-4 size-14 text-slate-300" />
              <p className="font-medium text-slate-600">السلة فارغة</p>
              <p className="mt-1 text-sm text-muted-foreground">
                أضف منتجات من القائمة على اليسار
              </p>
            </div>
          ) : (
            cart.map((item, index) => {
              const price = item.variant?.price ?? item.product.price;
              const image = item.variant?.image ?? item.product.image;
              const imageSrc = resolvePosImageUrl(image, baseUrl);

              return (
                <div
                  key={`${item.product.id}-${item.variant?.id ?? "default"}-${index}`}
                  className="rounded-2xl border border-slate-100 bg-slate-50/60 p-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border bg-white">
                      {imageSrc ? (
                        <img
                          src={imageSrc}
                          alt={item.product.title}
                          className="size-full object-contain p-1"
                        />
                      ) : (
                        <Package className="size-7 text-slate-300" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1 text-right">
                      <h4 className="line-clamp-1 font-semibold text-slate-900">
                        {item.product.title}
                      </h4>
                      {Object.keys(item.selectedOptions).length > 0 ? (
                        <div className="mt-1 flex flex-wrap justify-end gap-1">
                          {Object.entries(item.selectedOptions).map(([optionName, value]) => (
                            <Badge key={optionName} variant="secondary" className="text-[10px]">
                              {optionName}: {value}
                            </Badge>
                          ))}
                        </div>
                      ) : null}
                      <p className="mt-1 text-sm font-medium text-sky-600 tabular-nums">
                        {formatPosPrice(price)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-destructive hover:bg-destructive/10"
                      onClick={() => onRemove(index)}
                    >
                      <Trash2 className="size-4" />
                    </Button>

                    <div className="flex items-center gap-2 rounded-full border bg-white px-1 py-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7 rounded-full"
                        onClick={() => onUpdateQuantity(index, -1)}
                      >
                        <Minus className="size-3.5" />
                      </Button>
                      <span className="w-6 text-center text-sm font-bold tabular-nums">
                        {item.quantity}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7 rounded-full"
                        onClick={() => onUpdateQuantity(index, 1)}
                      >
                        <Plus className="size-3.5" />
                      </Button>
                    </div>

                    <span className="text-sm font-bold text-slate-900 tabular-nums">
                      {formatPosPrice((price ?? 0) * item.quantity)}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {cart.length > 0 ? (
        <div className="rounded-3xl bg-white p-5 shadow-sm">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">عدد العناصر</span>
              <span className="font-semibold tabular-nums">{itemCount}</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">المجموع</span>
              <span className="text-2xl font-bold text-sky-600 tabular-nums">
                {formatPosPrice(total)}
              </span>
            </div>
          </div>

          <Button
            className="mt-4 h-12 w-full rounded-full bg-[#00b7ff] text-base font-semibold text-white hover:bg-[#00a3e6]"
            onClick={onCheckout}
            disabled={isAddingProducts}
          >
            {isAddingProducts ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                جاري الإضافة...
              </>
            ) : orderId ? (
              "إضافة إلى الطلب"
            ) : (
              "إتمام الطلب"
            )}
          </Button>
        </div>
      ) : null}
    </div>
  );
};

export default POSCartPanel;
