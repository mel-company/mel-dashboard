import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useVerify } from "@/api/wrappers/auth.wrappers";

const OTP = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const phone = searchParams.get("phone") ?? "";
  const store = searchParams.get("store") ?? "";

  const [code, setCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const { mutate: verify, isPending: isVerifyingPending } = useVerify();

  const maskedPhone = useMemo(() => {
    const digits = phone.replace(/\D/g, "");
    if (!digits) return "";
    const tail = digits.slice(-3);
    return `${digits
      .slice(0, Math.max(0, digits.length - 3))
      .replace(/\d/g, "•")}${tail}`;
  }, [phone]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((v) => Math.max(0, v - 1)), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 4) {
      toast.error("يرجى إدخال رمز مكوّن من 4 أرقام");
      return;
    }

    setIsVerifying(true);
    try {
      verify(
        {
          phone: phone,
          code: code,
          store: {
            name: store,
            domain: store,
          },
        },
        {
          onSuccess: () => {
            navigate("/");
          },
          onError: () => {
            toast.error("فشل تحقق الرمز. يرجى المحاولة مرة أخرى");
          },
          onSettled: () => setIsVerifying(false),
        }
      );
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = () => {
    if (cooldown > 0) return;
    setCooldown(30);
    toast.success("تمت إعادة إرسال رمز التحقق");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <Card className="w-full max-w-md shadow-xl border-0">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-linear-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            رمز التحقق
          </CardTitle>
          <CardDescription className="text-base">
            أدخل رمز التحقق المكوّن من 4 أرقام
            {maskedPhone ? (
              <>
                {" "}
                المرسل إلى <span dir="ltr">{maskedPhone}</span>
              </>
            ) : null}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleVerify} className="space-y-5">
            <div className="flex justify-center" dir="ltr">
              <InputOTP
                maxLength={4}
                value={code}
                onChange={(v) => setCode(v.replace(/\D/g, ""))}
                inputMode="numeric"
                autoFocus
                aria-label="رمز التحقق"
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                </InputOTPGroup>
              </InputOTP>
            </div>

            <Button
              type="submit"
              className="w-full bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              disabled={isVerifying || code.length !== 4}
            >
              {isVerifying ? "جاري التحقق..." : "تأكيد الرمز"}
            </Button>

            <div className="flex items-center justify-between gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={() => navigate("/store-login")}
              >
                <ArrowLeft className="w-4 h-4 ml-2" />
                تعديل الرقم
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={handleResend}
                disabled={cooldown > 0}
              >
                {cooldown > 0
                  ? `إعادة الإرسال خلال ${cooldown}s`
                  : "إعادة إرسال"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default OTP;
