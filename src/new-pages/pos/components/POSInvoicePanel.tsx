import { Loader2, Package, Percent, Printer, Trash2 } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import type { CartItem } from "../utils";
import {
  formatPosPrice,
  getCategoryName,
  getDisplayName,
  resolvePosImageUrl,
} from "../utils";
import type { POSCheckoutForm } from "./POSCheckoutDialog";

type PaymentMethodOption = { id: string; name: string };

type POSInvoicePanelProps = {
  cart: CartItem[];
  baseUrl: string;
  total: number;
  form: POSCheckoutForm;
  onFormChange: (patch: Partial<POSCheckoutForm>) => void;
  paymentMethods: PaymentMethodOption[];
  states?: any[];
  regions?: any[];
  isLoadingPaymentMethods?: boolean;
  isLoadingStates?: boolean;
  isLoadingRegions?: boolean;
  cashOnDelivery: boolean;
  onCashOnDeliveryChange: (value: boolean) => void;
  showCoupon: boolean;
  onToggleCoupon: () => void;
  isCheckingOut: boolean;
  isAddingProducts?: boolean;
  onPay: () => void;
  onCancel: () => void;
  onUpdateQuantity: (index: number, delta: number) => void;
  onRemove: (index: number) => void;
  className?: string;
};

const fieldClass =
  "h-12 rounded-[14px] border-0 bg-white px-4 text-right shadow-none focus-visible:ring-2 focus-visible:ring-sky-500/30 dark:bg-slate-950";

const POSInvoicePanel = ({
  cart,
  baseUrl,
  total,
  form,
  onFormChange,
  paymentMethods,
  states = [],
  regions = [],
  isLoadingPaymentMethods,
  isLoadingStates,
  isLoadingRegions,
  cashOnDelivery,
  onCashOnDeliveryChange,
  showCoupon,
  onToggleCoupon,
  isCheckingOut,
  isAddingProducts,
  onPay,
  onCancel,
  onUpdateQuantity,
  onRemove,
  className,
}: POSInvoicePanelProps) => {
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className={cn("flex h-full min-h-0 flex-col gap-3", className)}>
      <section className="overflow-hidden rounded-3xl border border-slate-100 bg-white p-[18px] shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 rounded-full bg-orange-500/10 px-2 py-1">
            <span className="text-[11px] font-medium text-orange-600">
              دفع عند الاستلام
            </span>
            <Switch
              checked={cashOnDelivery}
              onToggle={onCashOnDeliveryChange}
            />
          </div>
          <h2 className="text-xl font-medium text-slate-700 dark:text-slate-100">
            تفاصيل الفاتورة
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-3 rounded-xl bg-slate-50 p-3 sm:grid-cols-2 dark:bg-slate-900/60">
          <Field label="اسم العميل">
            <Input
              value={form.name}
              onChange={(e) => onFormChange({ name: e.target.value })}
              placeholder="اسم العميل الثنائي"
              className={fieldClass}
            />
          </Field>
          <Field label="رقم الهاتف">
            <Input
              value={form.phone}
              onChange={(e) => onFormChange({ phone: e.target.value })}
              placeholder="077X XXX XXXX"
              className={fieldClass}
              dir="ltr"
            />
          </Field>
          <Field label="البريد الالكتروني">
            <Input
              value={form.email}
              onChange={(e) => onFormChange({ email: e.target.value })}
              placeholder="mel.customer@example.com"
              className={fieldClass}
              dir="ltr"
            />
          </Field>
          <Field label="طريقة الدفع">
            <Select
              value={form.paymentMethodId || undefined}
              onValueChange={(v) => onFormChange({ paymentMethodId: v })}
              disabled={isLoadingPaymentMethods}
            >
              <SelectTrigger className={fieldClass}>
                <SelectValue placeholder="اختر طريقة الدفع" />
              </SelectTrigger>
              <SelectContent>
                {paymentMethods.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="المحافظة">
            <Select
              value={form.stateId || undefined}
              onValueChange={(v) =>
                onFormChange({ stateId: v, regionId: "" })
              }
              disabled={isLoadingStates}
            >
              <SelectTrigger className={fieldClass}>
                <SelectValue placeholder="اختر المحافظة" />
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
              <SelectTrigger className={fieldClass}>
                <SelectValue placeholder="مثال : البلديات" />
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
          <Field label="اقرب نقطة دالة">
            <Input
              value={form.nearest_point}
              onChange={(e) => onFormChange({ nearest_point: e.target.value })}
              placeholder="مثال : معلم مشهور او نقطة معروفة"
              className={fieldClass}
            />
          </Field>
          <Field label="الملاحظات">
            <Input
              value={form.note}
              onChange={(e) => onFormChange({ note: e.target.value })}
              placeholder="اكتب ملاحظات اضافية للسائق"
              className={fieldClass}
            />
          </Field>
        </div>
      </section>

      <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="custom-scrollbar min-h-0 flex-1 overflow-auto">
          <table className="w-full min-w-[520px] text-sm">
            <thead className="sticky top-0 z-[1] bg-slate-50 text-slate-600 dark:bg-slate-900 dark:text-slate-300">
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <th className="px-3 py-3.5 text-center font-medium">العمليات</th>
                <th className="px-3 py-3.5 text-center font-medium">
                  أجمالي السعر
                </th>
                <th className="px-3 py-3.5 text-center font-medium">سعر مفرد</th>
                <th className="px-3 py-3.5 text-center font-medium">عدد</th>
                <th className="px-3 py-3.5 text-right font-medium">
                  معلومات الفئة
                </th>
                <th className="px-3 py-3.5 text-center font-medium">الصورة</th>
              </tr>
            </thead>
            <tbody>
              {cart.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-16 text-center text-slate-500"
                  >
                    السلة فارغة — أضف منتجات من القائمة
                  </td>
                </tr>
              ) : (
                cart.map((item, index) => {
                  const unit = item.variant?.price ?? item.product.price ?? 0;
                  const lineTotal = unit * item.quantity;
                  const imageSrc = resolvePosImageUrl(
                    item.variant?.image ?? item.product.image,
                    baseUrl,
                  );
                  const category =
                    item.product.categories?.[0] != null
                      ? getCategoryName(item.product.categories[0])
                      : "—";

                  return (
                    <tr
                      key={`${item.product.id}-${item.variant?.id ?? "d"}-${index}`}
                      className="border-b border-slate-50 dark:border-slate-900"
                    >
                      <td className="px-3 py-3 text-center">
                        <button
                          type="button"
                          className="inline-flex size-10 items-center justify-center rounded-xl bg-rose-500/10 text-rose-500"
                          onClick={() => onRemove(index)}
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </td>
                      <td className="px-3 py-3 text-center font-medium tabular-nums">
                        {formatPosPrice(lineTotal)}
                      </td>
                      <td className="px-3 py-3 text-center tabular-nums text-slate-600">
                        {formatPosPrice(unit)}
                      </td>
                      <td className="px-3 py-3 text-center">
                        <div className="inline-flex items-center gap-1 rounded-xl bg-slate-100 px-1 dark:bg-slate-900">
                          <button
                            type="button"
                            className="size-7 rounded-lg text-lg leading-none"
                            onClick={() => onUpdateQuantity(index, -1)}
                          >
                            −
                          </button>
                          <span className="min-w-6 tabular-nums">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            className="size-7 rounded-lg text-lg leading-none"
                            onClick={() => onUpdateQuantity(index, 1)}
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-right">
                        <p className="font-bold text-slate-900 dark:text-slate-50">
                          {item.product.title}
                        </p>
                        <p className="text-xs text-slate-500">{category}</p>
                      </td>
                      <td className="px-3 py-3">
                        <div className="mx-auto flex size-12 items-center justify-center overflow-hidden rounded-xl bg-slate-50 dark:bg-slate-900">
                          {imageSrc ? (
                            <img
                              src={imageSrc}
                              alt=""
                              className="size-full object-contain p-1"
                            />
                          ) : (
                            <Package className="size-5 text-slate-300" />
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="space-y-3 border-t border-slate-100 p-4 dark:border-slate-800">
          {showCoupon ? (
            <Input
              value={form.couponCode}
              onChange={(e) => onFormChange({ couponCode: e.target.value })}
              placeholder="رمز الخصم"
              className={fieldClass}
            />
          ) : null}

          <div className="flex flex-wrap items-center justify-between gap-3">
            <Button
              type="button"
              variant="outline"
              className="h-11 gap-2 rounded-2xl border-sky-500/20 bg-sky-500/10 text-sky-600"
              onClick={onToggleCoupon}
            >
              أضافة خصم
              <Percent className="size-4" />
            </Button>
            <div className="text-right">
              <p className="text-sm text-slate-500">
                أجمالي العناصر المحجوزة{" "}
                <span className="font-bold text-slate-800 dark:text-slate-100">
                  {itemCount}
                </span>
              </p>
              <p className="text-2xl font-extrabold tabular-nums text-slate-900 dark:text-white">
                {formatPosPrice(total)}
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="ghost"
              className="h-12 flex-1 rounded-2xl text-slate-500"
              onClick={onCancel}
            >
              الغاء
            </Button>
            <Button
              type="button"
              className="h-12 flex-[2] gap-2 rounded-2xl bg-sky-500 text-base font-bold text-white hover:bg-sky-600"
              disabled={
                cart.length === 0 || isCheckingOut || !!isAddingProducts
              }
              onClick={onPay}
            >
              {isCheckingOut || isAddingProducts ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                <Printer className="size-5" />
              )}
              دفع الفاتورة
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <Label className="block px-1 text-right text-sm font-medium text-slate-500">
        {label}
      </Label>
      {children}
    </div>
  );
}

export default POSInvoicePanel;
