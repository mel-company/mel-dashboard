import { useState, useEffect, useRef } from "react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { sanitizePhoneNumber } from "@/utils/helpers";
import { useValidatePhone } from "@/api/wrappers/auth.wrappers";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface PhoneNumberInputProps {
  value?: string;
  onChange?: (phone: string, isValid: boolean) => void;
  label?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  required?: boolean;
}

const PhoneNumberInput = ({
  value = "",
  onChange,
  label = "رقم الهاتف",
  placeholder = "7xx xxx xxxx",
  className,
  disabled = false,
  required = false,
}: PhoneNumberInputProps) => {
  const [phone, setPhone] = useState(value);
  const [validationError, setValidationError] = useState<string>("");
  const [apiError, setApiError] = useState<string>("");
  const [isValidating, setIsValidating] = useState(false);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const validationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  const { mutate: validatePhone, isPending: isPendingValidation } =
    useValidatePhone();

  // Sync with external value prop and enforce first digit is 7
  useEffect(() => {
    if (value !== phone) {
      setPhone(value);
      setIsValid(null);
      setValidationError("");
      setApiError("");
    }
  }, [value]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(e.target.value);
    setIsValid(null);
    setValidationError("");
    setApiError("");

    // Clear existing timeout
    if (validationTimeoutRef.current) {
      clearTimeout(validationTimeoutRef.current);
    }

    // Validate and call API after user stops typing (debounce)
    if (phone.length >= 10) {
      validationTimeoutRef.current = setTimeout(() => {
        validatePhoneNumber(phone);
      }, 500);
    } else if (phone.length === 0) {
      // Reset state when input is cleared
      setIsValid(null);
      if (onChange) {
        onChange("", false);
      }
    }
  };

  const validatePhoneNumber = (phoneNumber: string) => {
    if (!phoneNumber || phoneNumber.length === 0) {
      setIsValid(null);
      setValidationError("");
      setApiError("");
      if (onChange) {
        onChange("", false);
      }
      return;
    }

    setIsValidating(true);
    setValidationError("");
    setApiError("");

    try {
      // Validate using sanitizePhoneNumber helper
      const sanitizedPhone = sanitizePhoneNumber(phoneNumber, "+964");

      // If validation passes, call API
      validatePhone(
        { phone: sanitizedPhone },
        {
          onSuccess: (data: any) => {
            setIsValidating(false);
            if (data?.isValid === true) {
              setIsValid(true);
              setApiError("");
              if (onChange) {
                onChange(sanitizedPhone, true);
              }
            } else {
              setIsValid(false);
              setApiError(data?.message || "رقم الهاتف مستخدم بالفعل");
              if (onChange) {
                onChange(sanitizedPhone, false);
              }
            }
          },
          onError: (error: any) => {
            setIsValidating(false);
            setIsValid(false);
            setApiError(
              error?.response?.data?.message ||
                "حدث خطأ أثناء التحقق من رقم الهاتف"
            );
            if (onChange) {
              try {
                const sanitized = sanitizePhoneNumber(phoneNumber, "+964");
                onChange(sanitized, false);
              } catch {
                onChange(phoneNumber, false);
              }
            }
          },
        }
      );
    } catch (error: any) {
      setIsValidating(false);
      setIsValid(false);
      setValidationError(
        error?.message ||
          "رقم الهاتف غير صحيح. يجب أن يبدأ بـ 7 ويتكون من 10 أرقام"
      );
      if (onChange) {
        onChange(phoneNumber, false);
      }
    }
  };

  const handleBlur = () => {
    // Clear timeout and validate immediately on blur
    if (validationTimeoutRef.current) {
      clearTimeout(validationTimeoutRef.current);
    }

    if (phone && phone.length > 0) {
      validatePhoneNumber(phone);
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (validationTimeoutRef.current) {
        clearTimeout(validationTimeoutRef.current);
      }
    };
  }, []);

  const showError = validationError || apiError;
  const isPending = isPendingValidation || isValidating;

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label htmlFor="phone-input" className="text-sm font-medium">
          {label}
          {required && <span className="text-destructive mr-1">*</span>}
        </Label>
      )}
      <div className="relative">
        {/* Input Field */}
        <Input
          id="phone-input"
          type="tel"
          inputMode="numeric"
          value={phone}
          onChange={handlePhoneChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled || isPending}
          className={cn(
            "pl-12 pr-10",
            showError && "border-destructive focus-visible:ring-destructive",
            isValid === true && "border-green-500 focus-visible:ring-green-500"
          )}
          dir="ltr"
          maxLength={10}
          autoComplete="tel"
        />

        {/* Country Code Display - Right Side */}
        <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
          <span className="text-sm font-medium text-muted-foreground">
            964+
          </span>
        </div>

        {/* Status Icons */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center">
          {isPending ? (
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
          ) : isValid === true ? (
            <CheckCircle2 className="w-4 h-4 text-green-500" />
          ) : isValid === false ? (
            <XCircle className="w-4 h-4 text-destructive" />
          ) : null}
        </div>
      </div>

      {/* Error Messages */}
      {showError && (
        <p className="text-xs text-destructive flex items-center gap-1">
          <XCircle className="w-3 h-3" />
          {showError}
        </p>
      )}

      {/* Success Message */}
      {isValid === true && !showError && (
        <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3" />
          رقم الهاتف صحيح ومتاح
        </p>
      )}
    </div>
  );
};

export default PhoneNumberInput;
