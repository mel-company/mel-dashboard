import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Save, Loader2, Ticket, CheckCircle2, XCircle, ArrowRight } from "lucide-react";
import { useCreateCoupon, useCheckCodeAvailability } from "@/api/wrappers/coupon.wrappers";
import { toast } from "sonner";

function useDebouncedValue<T>(value: T, delayMs: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebouncedValue(value), delayMs);
    return () => clearTimeout(id);
  }, [value, delayMs]);

  return debouncedValue;
}

type Props = {};

const AddCoupon = ({}: Props) => {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [value, setValue] = useState("");
  const [minOrderTotal, setMinOrderTotal] = useState("");
  // @ts-ignore
  const [maxDiscount, setMaxDiscount] = useState("");
  const [usageLimit, setUsageLimit] = useState("");
  // @ts-ignore
  const [perUserLimit, setPerUserLimit] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [isActive, setIsActive] = useState(true);

  const { mutate: createCoupon, isPending: isCreating } = useCreateCoupon();

  // Debounce code for availability check
  const debouncedCode = useDebouncedValue(code.trim(), 500);
  const shouldCheckCode = debouncedCode.length >= 2 && debouncedCode.length <= 50;

  const {
    data: codeAvailability,
    isLoading: isCheckingCode,
    // @ts-ignore
    error: codeCheckError,
  } = useCheckCodeAvailability(
    shouldCheckCode ? { code: debouncedCode } : undefined,
    shouldCheckCode
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!code.trim()) {
      toast.error("يرجى إدخال رمز الكوبون");
      return;
    }

    if (code.trim().length < 2 || code.trim().length > 50) {
      toast.error("رمز الكوبون يجب أن يكون بين 2 و 50 حرف");
      return;
    }

    // Check if code is available (if we have the check result)
    if (codeAvailability && !codeAvailability.available) {
      toast.error("رمز الكوبون مستخدم بالفعل. يرجى اختيار رمز آخر");
      return;
    }

    if (!value.trim() || isNaN(Number(value)) || Number(value) <= 0) {
      toast.error("يرجى إدخال قيمة صحيحة للخصم");
      return;
    }

    // Prepare data
    const couponData: any = {
      code: code.trim(),
      description: description.trim() || undefined,
      value: Number(value),
      appliesTo: "ALL", // Set automatically by API
      isActive,
    };

    // Add optional fields if provided
    if (minOrderTotal.trim() && !isNaN(Number(minOrderTotal)) && Number(minOrderTotal) >= 0) {
      couponData.minOrderTotal = Number(minOrderTotal);
    }

    if (maxDiscount.trim() && !isNaN(Number(maxDiscount)) && Number(maxDiscount) >= 0) {
      couponData.maxDiscount = Number(maxDiscount);
    }

    if (usageLimit.trim() && !isNaN(Number(usageLimit)) && Number(usageLimit) > 0) {
      couponData.usageLimit = Number(usageLimit);
    }

    if (perUserLimit.trim() && !isNaN(Number(perUserLimit)) && Number(perUserLimit) > 0) {
      couponData.perUserLimit = Number(perUserLimit);
    }

    if (startsAt.trim()) {
      couponData.startsAt = new Date(startsAt).toISOString();
    }

    if (expiresAt.trim()) {
      couponData.expiresAt = new Date(expiresAt).toISOString();
    }

    createCoupon(couponData, {
      onSuccess: (data) => {
        toast.success("تم إنشاء الكوبون بنجاح");
        navigate(`/coupons/${data.id}`);
      },
      onError: (error: any) => {
        toast.error(
          error?.response?.data?.message || "فشل في إنشاء الكوبون. حاول مرة أخرى."
        );
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/coupons")}
          >
            <ArrowRight className="size-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-right">إضافة كوبون جديد</h1>
            <p className="text-sm text-muted-foreground text-right">
              قم بإنشاء كوبون خصم جديد لعملائك
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-right flex items-center gap-2">
                  <Ticket className="size-5" />
                  المعلومات الأساسية
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Code */}
                <div className="space-y-2">
                  <Label htmlFor="code" className="text-right">
                    رمز الكوبون <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="code"
                      type="text"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder="مثال: RAMADAN20"
                      className={`text-right pr-10 ${
                        codeAvailability && !codeAvailability.available
                          ? "border-destructive focus-visible:ring-destructive"
                          : codeAvailability && codeAvailability.available
                          ? "border-green-500 focus-visible:ring-green-500"
                          : ""
                      }`}
                      dir="rtl"
                      required
                      maxLength={50}
                    />
                    {shouldCheckCode && (
                      <div className="absolute left-3 top-1/2 -translate-y-1/2">
                        {isCheckingCode ? (
                          <Loader2 className="size-4 animate-spin text-muted-foreground" />
                        ) : codeAvailability ? (
                          codeAvailability.available ? (
                            <CheckCircle2 className="size-4 text-green-500" />
                          ) : (
                            <XCircle className="size-4 text-destructive" />
                          )
                        ) : null}
                      </div>
                    )}
                  </div>
                  {shouldCheckCode && codeAvailability && (
                    <p
                      className={`text-xs text-right ${
                        codeAvailability.available
                          ? "text-green-600 dark:text-green-400"
                          : "text-destructive"
                      }`}
                    >
                      {codeAvailability.message}
                    </p>
                  )}
                  {!shouldCheckCode && code.trim().length > 0 && code.trim().length < 2 && (
                    <p className="text-xs text-muted-foreground text-right">
                      يجب أن يكون الرمز فريداً لكل متجر (2-50 حرف)
                    </p>
                  )}
                  {!shouldCheckCode && code.trim().length === 0 && (
                    <p className="text-xs text-muted-foreground text-right">
                      يجب أن يكون الرمز فريداً لكل متجر (2-50 حرف)
                    </p>
                  )}
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-right">
                    الوصف
                  </Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="وصف الكوبون..."
                    className="text-right min-h-[100px]"
                    dir="rtl"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Discount Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-right">تفاصيل الخصم</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Value */}
                <div className="space-y-2">
                  <Label htmlFor="value" className="text-right">
                    نسبة الخصم <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="value"
                    type="number"
                    step="0.01"
                    min="0"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="مثال: 20"
                    className="text-right"
                    dir="rtl"
                    required
                  />
                </div>

                {/* Max Discount */}
                {/* <div className="space-y-2">
                  <Label htmlFor="maxDiscount" className="text-right">
                    الحد الأقصى للخصم (اختياري)
                  </Label>
                  <Input
                    id="maxDiscount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={maxDiscount}
                    onChange={(e) => setMaxDiscount(e.target.value)}
                    placeholder="مثال: 50"
                    className="text-right"
                    dir="rtl"
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    الحد الأقصى لمبلغ الخصم (للكوبونات النسبية)
                  </p>
                </div> */}

                {/* Min Order Total */}
                <div className="space-y-2">
                  <Label htmlFor="minOrderTotal" className="text-right">
                    الحد الأدنى لقيمة الطلب (اختياري)
                  </Label>
                  <Input
                    id="minOrderTotal"
                    type="number"
                    step="0.01"
                    min="0"
                    value={minOrderTotal}
                    onChange={(e) => setMinOrderTotal(e.target.value)}
                    placeholder="مثال: 100000"
                    className="text-right"
                    dir="rtl"
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    الحد الأدنى لقيمة الطلب المطلوبة لاستخدام هذا الكوبون
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Usage Limits */}
            <Card>
              <CardHeader>
                <CardTitle className="text-right">حدود الاستخدام</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Usage Limit */}
                <div className="space-y-2">
                  <Label htmlFor="usageLimit" className="text-right">
                    الحد الأقصى لعدد الاستخدامات
                  </Label>
                  <Input
                    id="usageLimit"
                    type="number"
                    min="1"
                    value={usageLimit}
                    onChange={(e) => setUsageLimit(e.target.value)}
                    placeholder="100"
                    className="text-right"
                    dir="rtl"
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    إجمالي عدد المرات التي يمكن استخدام هذا الكوبون فيها
                  </p>
                </div>

                {/* Per User Limit */}
                {/* <div className="space-y-2">
                  <Label htmlFor="perUserLimit" className="text-right">
                    الحد الأقصى لكل مستخدم (اختياري)
                  </Label>
                  <Input
                    id="perUserLimit"
                    type="number"
                    min="1"
                    value={perUserLimit}
                    onChange={(e) => setPerUserLimit(e.target.value)}
                    placeholder="1"
                    className="text-right"
                    dir="rtl"
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    عدد المرات التي يمكن لكل مستخدم استخدام هذا الكوبون
                  </p>
                </div> */}
              </CardContent>
            </Card>

            {/* Dates */}
            <Card>
              <CardHeader>
                <CardTitle className="text-right">التواريخ</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Start Date */}
                <div className="space-y-2">
                  <Label htmlFor="startsAt" className="text-right">
                    تاريخ البدء (اختياري)
                  </Label>
                  <Input
                    id="startsAt"
                    type="datetime-local"
                    value={startsAt}
                    onChange={(e) => setStartsAt(e.target.value)}
                    className="text-right"
                    dir="rtl"
                  />
                </div>

                {/* Expiry Date */}
                <div className="space-y-2">
                  <Label htmlFor="expiresAt" className="text-right">
                    تاريخ الانتهاء (اختياري)
                  </Label>
                  <Input
                    id="expiresAt"
                    type="datetime-local"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    className="text-right"
                    dir="rtl"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-right">الحالة</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="isActive" className="text-right">
                    تفعيل الكوبون
                  </Label>
                  <Switch
                    id="isActive"
                    checked={isActive}
                    onCheckedChange={setIsActive}
                  />
                </div>
                <p className="text-xs text-muted-foreground text-right">
                  الكوبونات المفعلة فقط يمكن استخدامها
                </p>
              </CardContent>
            </Card>

            {/* Actions Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-right">الإجراءات</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  type="submit"
                  className="w-full gap-2"
                  disabled={
                    isCreating ||
                    (codeAvailability && !codeAvailability.available) ||
                    (shouldCheckCode && isCheckingCode)
                  }
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      جاري الإنشاء...
                    </>
                  ) : (
                    <>
                      <Save className="size-4" />
                      حفظ الكوبون
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  className="w-full gap-2"
                  onClick={() => navigate("/coupons")}
                  disabled={isCreating}
                >
                  <XCircle className="size-4" />
                  إلغاء
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddCoupon;
