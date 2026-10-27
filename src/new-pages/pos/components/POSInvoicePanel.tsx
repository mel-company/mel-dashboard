import { Loader2, Minus, Package, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { CartItem } from "../utils";
import {
  formatPosPrice,
  getDisplayName,
  resolvePosImageUrl,
  variantLabel,
} from "../utils";

export type POSFulfilment = "PICKUP" | "DELIVERY";

export type POSInvoiceForm = {
  fulfilment: POSFulfilment;
  name: string;
  phone: string;
  stateId: string;
  regionId: string;
  nearest_point: string;
  note: string;
  couponCode: string;
};

export type POSCouponState =
  | { status: "idle" }
  | { status: "checking" }
  | { status: "valid"; discount: number }
  | { status: "invalid"; message: string };

type POSInvoicePanelProps = {
  cart: CartItem[];
  baseUrl: string;
  /** Adding to an existing order: no customer, no payment, just the lines. */
  addingToOrder: boolean;
  form: POSInvoiceForm;
  onFormChange: (patch: Partial<POSInvoiceForm>) => void;
  states?: any[];
  regions?: any[];
  isLoadingStates?: boolean;
  isLoadingRegions?: boolean;
  coupon: POSCouponState;
  subtotal: number;
  discount: number;
  total: number;
  /** Why the main button is off, shown under it. */
  blockedReason: string | null;
  isSubmitting: boolean;
  onSubmit: () => void;
  onClear: () => void;
  onUpdateQuantity: (index: number, delta: number) => void;
  onRemove: (index: number) => void;
  className?: string;
};

const fieldClass =
  "h-10 rounded-xl border border-slate-200 bg-white px-3 text-right text-sm shadow-none focus-visible:ring-2 focus-visible:ring-sky-500/30 dark:border-slate-800 dark:bg-slate-950";

/**
 * The invoice: lines first, then who it is for, then what is owed.
 *
 * It used to open with eight customer fields — email, province and city
 * required — for a customer standing at the counter, which on a laptop pushed
 * the lines into a sliver and the pay button below the fold. A counter sale
 * now asks for nothing; the address only appears for «توصيل».
 */
const POSInvoicePanel = ({
  cart,
  baseUrl,
  addingToOrder,
  form,
  onFormChange,
  states = [],
  regions = [],
  isLoadingStates,
  isLoadingRegions,
  coupon,
  subtotal,
  discount,
  total,
  blockedReason,
  isSubmitting,
  onSubmit,
  onClear,
  onUpdateQuantity,
  onRemove,
  className,
}: POSInvoicePanelProps) => {
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const isDelivery = form.fulfilment === "DELIVERY";

  const submitLabel = addingToOrder
    ? "إضافة إلى الطلب"
    : isDelivery
      ? "إنشاء طلب التوصيل"
      : "إتمام البيع";

  return (
    <div
      className={cn(
        "flex min-h-0 flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 dark:border-slate-800">
        <h2 className="text-base font-bold text-slate-900 dark:text-slate-50">
          الفاتورة
          <span className="ms-2 text-sm font-normal text-slate-500 tabular-nums">
            {itemCount} قطعة
          </span>
        </h2>
        {cart.length > 0 ? (
          <button
            type="button"
            onClick={onClear}
            className="text-sm text-slate-500 hover:text-rose-600"
          >
            إفراغ
          </button>
        ) : null}
      </div>

      <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto">
        {/* Lines */}
        <div className="min-h-[140px]">
          {cart.length === 0 ? (
            <p className="px-4 py-12 text-center text-sm text-slate-500">
              الفاتورة فارغة. اختر منتجاً من القائمة لإضافته.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead className="sticky top-0 z-[1] bg-slate-50 text-xs text-slate-500 dark:bg-slate-900">
                <tr>
                  <th className="px-3 py-2 text-right font-medium">المنتج</th>
                  <th className="px-2 py-2 text-center font-medium">الكمية</th>
                  <th className="px-2 py-2 text-left font-medium">المجموع</th>
                  <th className="w-9 px-1 py-2" aria-label="حذف" />
                </tr>
              </thead>
              <tbody>
                {cart.map((item, index) => {
                  const unit = item.variant?.price ?? item.product.price ?? 0;
                  const imageSrc = resolvePosImageUrl(
                    item.variant?.image ?? item.product.image,
                    baseUrl,
                  );
                  const atMax =
                    item.stock !== null && item.quantity >= item.stock;
                  return (
                    <tr
                      key={`${item.product.id}-${item.variant?.id ?? "d"}`}
                      className="border-t border-slate-100 dark:border-slate-800"
                    >
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <div className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-900">
                            {imageSrc ? (
                              <img
                                src={imageSrc}
                                alt=""
                                className="size-full object-contain"
                              />
                            ) : (
                              <Package className="size-4 text-slate-400" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="line-clamp-1 font-medium text-slate-900 dark:text-slate-50">
                              {item.product.title}
                            </p>
                            {item.variant ? (
                              <p className="line-clamp-1 text-xs text-slate-600 dark:text-slate-300">
                                {variantLabel(item.variant)}
                              </p>
                            ) : null}
                            <p className="whitespace-nowrap text-xs text-slate-500 tabular-nums">
                              {formatPosPrice(unit)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-2 py-2">
                        <div className="mx-auto flex w-fit items-center rounded-lg border border-slate-200 dark:border-slate-800">
                          <button
                            type="button"
                            className="flex size-7 items-center justify-center text-slate-600 disabled:opacity-40 dark:text-slate-300"
                            onClick={() => onUpdateQuantity(index, -1)}
                            disabled={item.quantity <= 1}
                            aria-label="إنقاص"
                          >
                            <Minus className="size-3.5" />
                          </button>
                          <span className="min-w-6 text-center tabular-nums">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            className="flex size-7 items-center justify-center text-slate-600 disabled:opacity-40 dark:text-slate-300"
                            onClick={() => onUpdateQuantity(index, 1)}
                            disabled={atMax}
                            title={atMax ? "لا يوجد مخزون إضافي" : undefined}
                            aria-label="زيادة"
                          >
                            <Plus className="size-3.5" />
                          </button>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-2 py-2 text-left font-medium tabular-nums">
                        {formatPosPrice(unit * item.quantity)}
                      </td>
                      <td className="px-1 py-2">
                        <button
                          type="button"
                          className="flex size-8 items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10"
                          onClick={() => onRemove(index)}
                          aria-label="حذف"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Who it is for */}
        {!addingToOrder ? (
          <div className="space-y-3 border-t border-slate-100 p-4 dark:border-slate-800">
            <div className="grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-900">
              {(
                [
                  ["PICKUP", "بيع مباشر"],
                  ["DELIVERY", "توصيل"],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => onFormChange({ fulfilment: value })}
                  className={cn(
                    "h-9 rounded-lg text-sm font-medium transition-colors",
                    form.fulfilment === value
                      ? "bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white"
                      : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-500">
              {isDelivery
                ? "يُنشأ طلب قيد الانتظار، والدفع عند الاستلام عبر شركة الشحن."
                : "يُسجّل الطلب مدفوعاً ومُسلّماً فوراً، بدون شحن."}
            </p>

            <div className="grid grid-cols-2 gap-3">
              <Field label={isDelivery ? "اسم العميل" : "اسم العميل (اختياري)"}>
                <Input
                  value={form.name}
                  onChange={(e) => onFormChange({ name: e.target.value })}
                  placeholder="الاسم"
                  className={fieldClass}
                />
              </Field>
              <Field label={isDelivery ? "رقم الهاتف" : "رقم الهاتف (اختياري)"}>
                <Input
                  value={form.phone}
                  onChange={(e) => onFormChange({ phone: e.target.value })}
                  placeholder="07XX XXX XXXX"
                  inputMode="tel"
                  className={cn(fieldClass, "text-left")}
                  dir="ltr"
                />
              </Field>
              {isDelivery ? (
                <>
                  <Field label="المحافظة">
                    <Select
                      value={form.stateId || undefined}
                      onValueChange={(v) =>
                        onFormChange({ stateId: v, regionId: "" })
                      }
                      disabled={isLoadingStates}
                    >
                      <SelectTrigger className={cn(fieldClass, "w-full")}>
                        <SelectValue placeholder="اختر" />
                      </SelectTrigger>
                      <SelectContent>
                        {states.map((s: any) => (
                          <SelectItem key={s.id} value={s.id}>
                            {getDisplayName(s.name)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="المنطقة">
                    <Select
                      value={form.regionId || undefined}
                      onValueChange={(v) => onFormChange({ regionId: v })}
                      disabled={!form.stateId || isLoadingRegions}
                    >
                      <SelectTrigger className={cn(fieldClass, "w-full")}>
                        <SelectValue
                          placeholder={form.stateId ? "اختر" : "اختر المحافظة أولاً"}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {regions.map((r: any) => (
                          <SelectItem key={r.id} value={r.id}>
                            {getDisplayName(r.name)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="أقرب نقطة دالة" className="col-span-2">
                    <Input
                      value={form.nearest_point}
                      onChange={(e) =>
                        onFormChange({ nearest_point: e.target.value })
                      }
                      placeholder="معلم معروف قرب العنوان"
                      className={fieldClass}
                    />
                  </Field>
                </>
              ) : null}
              <Field label="ملاحظات" className="col-span-2">
                <Input
                  value={form.note}
                  onChange={(e) => onFormChange({ note: e.target.value })}
                  placeholder={isDelivery ? "ملاحظة للسائق" : "ملاحظة على الطلب"}
                  className={fieldClass}
                />
              </Field>
              <Field label="رمز الخصم" className="col-span-2">
                <Input
                  value={form.couponCode}
                  onChange={(e) => onFormChange({ couponCode: e.target.value })}
                  placeholder="اختياري"
                  className={cn(fieldClass, "uppercase")}
                  dir="ltr"
                />
                {coupon.status === "checking" ? (
                  <p className="text-xs text-slate-500">جاري التحقق…</p>
                ) : coupon.status === "valid" ? (
                  <p className="text-xs text-emerald-600">
                    الرمز صالح، الخصم {formatPosPrice(coupon.discount)}
                  </p>
                ) : coupon.status === "invalid" ? (
                  <p className="text-xs text-rose-600">{coupon.message}</p>
                ) : null}
              </Field>
            </div>
          </div>
        ) : null}
      </div>

      {/* What is owed */}
      <div className="space-y-3 border-t border-slate-200 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-900/40">
        <dl className="space-y-1 text-sm">
          {discount > 0 || (isDelivery && !addingToOrder) ? (
            <div className="flex justify-between text-slate-600 dark:text-slate-300">
              <dt>المجموع</dt>
              <dd className="tabular-nums">{formatPosPrice(subtotal)}</dd>
            </div>
          ) : null}
          {discount > 0 ? (
            <div className="flex justify-between text-emerald-600">
              <dt>الخصم</dt>
              <dd className="tabular-nums">− {formatPosPrice(discount)}</dd>
            </div>
          ) : null}
          {isDelivery && !addingToOrder ? (
            <div className="flex justify-between text-slate-600 dark:text-slate-300">
              <dt>التوصيل</dt>
              <dd className="text-xs">تحسبه شركة الشحن عند إنشاء الطلب</dd>
            </div>
          ) : null}
          <div className="flex items-baseline justify-between pt-1">
            <dt className="font-medium text-slate-900 dark:text-slate-50">
              الإجمالي
            </dt>
            <dd className="text-2xl font-extrabold tabular-nums text-slate-900 dark:text-white">
              {formatPosPrice(total)}
            </dd>
          </div>
        </dl>

        <Button
          type="button"
          className="h-12 w-full rounded-xl bg-sky-500 text-base font-bold text-white hover:bg-sky-600 disabled:opacity-50"
          disabled={!!blockedReason || isSubmitting}
          onClick={onSubmit}
        >
          {isSubmitting ? <Loader2 className="size-5 animate-spin" /> : null}
          {submitLabel}
        </Button>
        {blockedReason && cart.length > 0 ? (
          <p className="text-center text-xs text-slate-500">{blockedReason}</p>
        ) : null}
      </div>
    </div>
  );
};

function Field({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("space-y-1", className)}>
      <Label className="block text-right text-xs font-medium text-slate-500">
        {label}
      </Label>
      {children}
    </div>
  );
}

export default POSInvoicePanel;
