import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, Loader2, MapPin, XCircle } from "lucide-react";
import { getDisplayName } from "../utils";

export type POSCheckoutForm = {
  name: string;
  email: string;
  phone: string;
  stateId: string;
  regionId: string;
  nearest_point: string;
  note: string;
  paymentMethodId: string;
  couponCode: string;
};

type PaymentMethodOption = {
  id: string;
  name: string;
};

type POSCheckoutDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: POSCheckoutForm;
  onFormChange: (patch: Partial<POSCheckoutForm>) => void;
  onSubmit: (e: React.FormEvent) => void;
  isCheckingOut: boolean;
  cartItemCount: number;
  total: number;
  showCouponValidation: boolean;
  isValidatingCoupon: boolean;
  couponValid: boolean;
  couponValidationMessage?: string;
  paymentMethods: PaymentMethodOption[];
  isLoadingPaymentMethods?: boolean;
  states?: any[];
  regions?: any[];
  isLoadingStates?: boolean;
  isLoadingRegions?: boolean;
};

const POSCheckoutDialog = ({
  open,
  onOpenChange,
  form,
  onFormChange,
  onSubmit,
  isCheckingOut,
  cartItemCount,
  total,
  showCouponValidation,
  isValidatingCoupon,
  couponValid,
  couponValidationMessage,
  paymentMethods,
  isLoadingPaymentMethods,
  states,
  regions,
  isLoadingStates,
  isLoadingRegions,
}: POSCheckoutDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] w-full max-w-3xl overflow-y-auto rounded-3xl text-right">
        <DialogHeader className="text-right">
          <DialogTitle className="text-right">إتمام الطلب</DialogTitle>
          <DialogDescription className="text-right">
            أدخل معلومات العميل لإتمام البيع من نقطة البيع
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">معلومات العميل</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="pos-name">
                  الاسم <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="pos-name"
                  value={form.name}
                  onChange={(e) => onFormChange({ name: e.target.value })}
                  placeholder="اسم العميل"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pos-phone">
                  الهاتف <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="pos-phone"
                  value={form.phone}
                  onChange={(e) => onFormChange({ phone: e.target.value })}
                  placeholder="9641234567890"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pos-email">
                  البريد الإلكتروني <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="pos-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => onFormChange({ email: e.target.value })}
                  placeholder="example@email.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pos-payment">
                  طريقة الدفع <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={form.paymentMethodId}
                  onValueChange={(value) =>
                    onFormChange({ paymentMethodId: value })
                  }
                  disabled={isLoadingPaymentMethods || isCheckingOut}
                >
                  <SelectTrigger id="pos-payment" className="w-full text-right">
                    <SelectValue placeholder="اختر طريقة الدفع" />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentMethods.length > 0 ? (
                      paymentMethods.map((method) => (
                        <SelectItem key={method.id} value={method.id}>
                          {method.name}
                        </SelectItem>
                      ))
                    ) : (
                      <div className="p-4 text-center text-sm text-muted-foreground">
                        لا توجد طرق دفع مفعّلة — فعّلها من الإعدادات
                      </div>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="flex items-center gap-2 text-lg font-semibold">
              <MapPin className="size-5" />
              عنوان التوصيل
            </h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="pos-state">
                  المحافظة <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={form.stateId}
                  onValueChange={(value) =>
                    onFormChange({ stateId: value, regionId: "" })
                  }
                  disabled={isLoadingStates || isCheckingOut}
                >
                  <SelectTrigger id="pos-state" className="w-full text-right">
                    <SelectValue placeholder="اختر المحافظة" />
                  </SelectTrigger>
                  <SelectContent>
                    {states?.map((state: any) => (
                      <SelectItem key={state.id} value={state.id}>
                        {getDisplayName(state.name?.arabic ?? state.name)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="pos-region">
                  المنطقة <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={form.regionId}
                  onValueChange={(value) => onFormChange({ regionId: value })}
                  disabled={
                    isLoadingRegions || !form.stateId || isCheckingOut
                  }
                >
                  <SelectTrigger id="pos-region" className="w-full text-right">
                    <SelectValue placeholder="اختر المنطقة" />
                  </SelectTrigger>
                  <SelectContent>
                    {regions?.map((region: any) => (
                      <SelectItem key={region.id} value={region.id}>
                        {getDisplayName(region.name?.arabic ?? region.name)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="pos-nearest">
                أقرب نقطة <span className="text-destructive">*</span>
              </Label>
              <Input
                id="pos-nearest"
                value={form.nearest_point}
                onChange={(e) =>
                  onFormChange({ nearest_point: e.target.value })
                }
                placeholder="عنوان مفصل أو استلام من المتجر"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pos-note">ملاحظات (اختياري)</Label>
              <Input
                id="pos-note"
                value={form.note}
                onChange={(e) => onFormChange({ note: e.target.value })}
                placeholder="ملاحظات إضافية للطلب"
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="coupon-code" className="block text-right">
              رمز الكوبون
            </Label>
            <Input
              id="coupon-code"
              value={form.couponCode}
              onChange={(e) => onFormChange({ couponCode: e.target.value })}
              placeholder="مثال: RAMADAN20"
              className="text-right placeholder:text-right"
              disabled={isCheckingOut}
            />
            {showCouponValidation ? (
              <div
                className={`flex items-center gap-2 text-sm ${
                  couponValid
                    ? "text-green-600"
                    : couponValidationMessage
                      ? "text-destructive"
                      : "text-muted-foreground"
                }`}
              >
                {isValidatingCoupon ? (
                  <>
                    <Loader2 className="size-4 shrink-0 animate-spin" />
                    <span>جاري التحقق...</span>
                  </>
                ) : couponValid ? (
                  <>
                    <CheckCircle2 className="size-4 shrink-0" />
                    <span className="text-right">{couponValidationMessage}</span>
                  </>
                ) : (
                  <>
                    <XCircle className="size-4 shrink-0" />
                    <span className="text-right">{couponValidationMessage}</span>
                  </>
                )}
              </div>
            ) : null}
          </div>

          <Separator />

          <div className="space-y-2 rounded-2xl bg-slate-50 p-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">عدد العناصر</span>
              <span className="font-semibold tabular-nums">{cartItemCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">المجموع</span>
              <span className="text-lg font-bold text-sky-600 tabular-nums">
                {total.toLocaleString("ar-IQ")} د.ع
              </span>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenChange(false)}
              disabled={isCheckingOut}
            >
              إلغاء
            </Button>
            <Button
              type="submit"
              disabled={isCheckingOut || !form.paymentMethodId}
              className="rounded-full bg-sky-500 hover:bg-sky-600"
            >
              {isCheckingOut ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  جاري المعالجة...
                </>
              ) : (
                "تأكيد الطلب"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default POSCheckoutDialog;
