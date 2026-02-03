import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCoupon, useValidateCoupon } from "@/api/wrappers/coupon.wrappers";
import { useQueryClient } from "@tanstack/react-query";
import { orderKeys } from "@/api/wrappers/order.wrappers";
import { toast } from "sonner";
import { Ticket, Loader2, CheckCircle2, XCircle } from "lucide-react";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string;
  orderTotal: number;
};

const VALIDATE_DEBOUNCE_MS = 500;

const UseCouponDialog = ({
  open,
  onOpenChange,
  orderId,
  orderTotal,
}: Props) => {
  const [code, setCode] = useState("");
  const [debouncedCode, setDebouncedCode] = useState("");
  const queryClient = useQueryClient();
  const { mutate: applyCoupon, isPending } = useCoupon();

  // Debounce code for validation when user finishes typing
  useEffect(() => {
    if (!open) return;
    const trimmed = code.trim();
    const timer = setTimeout(() => setDebouncedCode(trimmed), VALIDATE_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [code, open]);

  const validateParams =
    debouncedCode.length >= 2
      ? {
          code: debouncedCode,
          orderTotal: Number(orderTotal) || 0,
          orderId,
        }
      : null;

  const {
    data: validation,
    isFetching: isValidating,
    error: validateError,
  } = useValidateCoupon(validateParams, open);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = code?.trim();
    if (!trimmed) {
      toast.error("يرجى إدخال رمز الكوبون");
      return;
    }
    applyCoupon(
      {
        code: trimmed,
        orderTotal: Number(orderTotal) || 0,
        orderId,
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: orderKeys.detail(orderId),
          });
          toast.success("تم تطبيق الكوبون بنجاح");
          setCode("");
          onOpenChange(false);
        },
        onError: (err: any) => {
          const message =
            err?.response?.data?.message ||
            err?.message ||
            "فشل تطبيق الكوبون. تحقق من الرمز والشروط.";
          toast.error(message);
        },
      }
    );
  };

  const handleOpenChange = (next: boolean) => {
    if (!next && !isPending) {
      setCode("");
      setDebouncedCode("");
    }
    onOpenChange(next);
  };

  const showValidation =
    open && debouncedCode.length >= 2 && (isValidating || validation || validateError);
  const isValid = validation?.valid === true;
  const validationMessage =
    validation?.message ??
    (validateError as any)?.response?.data?.message ??
    (validateError as Error)?.message;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-right flex items-center gap-2">
            <Ticket className="size-5" />
            استخدام كوبون خصم
          </DialogTitle>
          <DialogDescription className="text-right">
            أدخل رمز الكوبون لتطبيق الخصم على الطلب. المبلغ الإجمالي الحالي:{" "}
            <span className="font-semibold">
              {orderTotal.toLocaleString()} د.ع
            </span>
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="coupon-code" className="text-right block">
              رمز الكوبون
            </Label>
            <Input
              id="coupon-code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="مثال: RAMADAN20"
              className="text-right placeholder:text-right"
              disabled={isPending}
              autoFocus
            />
            {showValidation && (
              <div
                className={`flex items-center gap-2 text-sm ${
                  isValid
                    ? "text-green-600"
                    : validateError || validation?.valid === false
                      ? "text-destructive"
                      : "text-muted-foreground"
                }`}
              >
                {isValidating ? (
                  <>
                    <Loader2 className="size-4 animate-spin shrink-0" />
                    <span>جاري التحقق...</span>
                  </>
                ) : isValid ? (
                  <>
                    <CheckCircle2 className="size-4 shrink-0" />
                    <span className="text-right">{validation?.message}</span>
                  </>
                ) : (
                  <>
                    <XCircle className="size-4 shrink-0" />
                    <span className="text-right">{validationMessage}</span>
                  </>
                )}
              </div>
            )}
          </div>
          <DialogFooter className="gap-2 flex-row-reverse">
            <Button
              type="button"
              variant="secondary"
              onClick={() => handleOpenChange(false)}
              disabled={isPending}
            >
              إلغاء
            </Button>
            <Button type="submit" disabled={isPending || !code?.trim()}>
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin ml-2" />
                  جاري التطبيق...
                </>
              ) : (
                "إستخدام"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UseCouponDialog;
