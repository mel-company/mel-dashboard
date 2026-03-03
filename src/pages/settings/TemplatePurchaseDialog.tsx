import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
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
import { CreditCard, Calendar, Lock, Loader2, Layout } from "lucide-react";
import type { WebsiteTemplate } from "./TemplateGalleryDialog";

const formatIqd = (amount: number) => {
  return `${amount.toLocaleString()} د.ع`;
};

interface TemplatePurchaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: WebsiteTemplate | null;
  onSuccess: (template: WebsiteTemplate) => void;
}

const TemplatePurchaseDialog = ({
  open,
  onOpenChange,
  template,
  onSuccess,
}: TemplatePurchaseDialogProps) => {
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvc, setCvc] = useState("");
  const [cardholderName, setCardholderName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const price = template?.price ?? 0;
  const isFree = price === 0;

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, "");
    const match = cleaned.match(/.{1,4}/g);
    return match ? match.join(" ") : cleaned;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 16);
    setCardNumber(formatCardNumber(value));
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length >= 2) {
      value = value.slice(0, 2) + "/" + value.slice(2, 4);
    }
    setExpiryDate(value);
  };

  const handleCvcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 4);
    setCvc(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!template) return;

    setIsSubmitting(true);
    // Dummy: simulate payment processing
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success("تم إضافة القالب إلى مكتبتك بنجاح");
      onSuccess(template);
      onOpenChange(false);
      resetForm();
    }, 800);
  };

  const resetForm = () => {
    setCardNumber("");
    setExpiryDate("");
    setCvc("");
    setCardholderName("");
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) resetForm();
    onOpenChange(next);
  };

  const isValid =
    cardNumber.replace(/\s/g, "").length >= 4 &&
    expiryDate.length === 5 &&
    cvc.length >= 3;

  if (!template) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-right flex items-center gap-2">
            <Layout className="size-5" />
            شراء القالب
          </DialogTitle>
          <DialogDescription className="text-right">
            أدخل بيانات بطاقتك لإتمام الدفع
          </DialogDescription>
        </DialogHeader>

        {/* Template info & price */}
        <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
          <h4 className="font-semibold text-right">{template.name}</h4>
          <p className="text-sm text-muted-foreground text-right line-clamp-2">
            {template.description}
          </p>
          <div className="flex items-center justify-between pt-2 border-t">
            <span className="text-sm text-muted-foreground">المبلغ</span>
            <span className="text-lg font-bold">
              {isFree ? formatIqd(0) : formatIqd(price)}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Cardholder name */}
          <div className="space-y-2">
            <Label htmlFor="cardholderName" className="text-right">
              اسم صاحب البطاقة
            </Label>
            <Input
              id="cardholderName"
              type="text"
              value={cardholderName}
              onChange={(e) => setCardholderName(e.target.value)}
              placeholder="الاسم كما يظهر على البطاقة"
              className="text-right"
              dir="rtl"
            />
          </div>

          {/* Card number */}
          <div className="space-y-2">
            <Label htmlFor="cardNumber" className="text-right">
              رقم البطاقة
            </Label>
            <div className="relative">
              <CreditCard className="absolute right-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
              <Input
                id="cardNumber"
                type="text"
                value={cardNumber}
                onChange={handleCardNumberChange}
                placeholder="1234 5678 9012 3456"
                maxLength={19}
                required
                className="text-right pr-10"
              />
            </div>
          </div>

          {/* Expiry and CVC */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expiryDate" className="text-right">
                تاريخ الانتهاء
              </Label>
              <div className="relative">
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
                <Input
                  id="expiryDate"
                  type="text"
                  value={expiryDate}
                  onChange={handleExpiryChange}
                  placeholder="MM/YY"
                  maxLength={5}
                  required
                  className="text-right pr-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cvc" className="text-right">
                رمز الأمان (CVC)
              </Label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
                <Input
                  id="cvc"
                  type="text"
                  value={cvc}
                  onChange={handleCvcChange}
                  placeholder="123"
                  maxLength={4}
                  required
                  className="text-right pr-10"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              إلغاء
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !isValid}
              className="gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  جاري المعالجة...
                </>
              ) : (
                <>
                  <CreditCard className="size-4" />
                  إتمام الدفع
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TemplatePurchaseDialog;
