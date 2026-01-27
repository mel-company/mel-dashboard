import { type Country } from "@/api/wrappers/country.wrappers";
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
import { Phone, CheckCircle2, Globe } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { DialogTrigger } from "@radix-ui/react-dialog";
import { validateInternationalPhoneNumber } from "@/utils/helpers";
import CountryCodeDialog from "./CountryCodeDialog";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPhoneNumberChange?: (phoneNumber: string, phoneCode: string) => void;
  initialPhoneNumber?: string;
  initialCountry?: Country | null;
};

const PhoneNumberDialog = ({
  open,
  onOpenChange,
  onPhoneNumberChange,
  initialPhoneNumber,
  initialCountry,
}: Props) => {
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [countryCodeDialogOpen, setCountryCodeDialogOpen] = useState(false);

  // Initialize form when dialog opens
  useEffect(() => {
    if (open) {
      // Set initial phone number if provided
      if (initialPhoneNumber) {
        setPhoneNumber(initialPhoneNumber);
      } else {
        setPhoneNumber("");
      }

      // Set initial country if provided
      if (initialCountry) {
        setSelectedCountry(initialCountry);
      } else {
        setSelectedCountry(null);
      }
    }
  }, [open, initialPhoneNumber, initialCountry]);

  // Handle country code selection from CountryCodeDialog
  const handleCountryCodeSelect = useCallback((country: Country) => {
    setSelectedCountry(country);
    setCountryCodeDialogOpen(false);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCountry) {
      toast.error("يرجى اختيار رمز الدولة");
      return;
    }

    if (!phoneNumber.trim()) {
      toast.error("يرجى إدخال رقم الهاتف");
      return;
    }

    // Call the callback if provided
    if (onPhoneNumberChange) {
      onPhoneNumberChange(phoneNumber.trim(), selectedCountry.phoneCode);
    }

    // Close dialog
    onOpenChange(false);
    toast.success("تم تحديث رقم الهاتف بنجاح");
  };

  // Optimized phone number input handler with useCallback
  const handlePhoneNumberChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers - optimized regex
    const value = e.target.value.replace(/\D/g, "");
    setPhoneNumber(value);
  }, []);

  const handleValidate = useCallback(() => {
    if (!selectedCountry) {
      toast.error("يرجى اختيار رمز الدولة");
      return;
    }
    
    const isValid = validateInternationalPhoneNumber(phoneNumber, selectedCountry.code2);

    if (isValid) {
      toast.success("رقم الهاتف صحيح");
    } else {
      toast.error("رقم الهاتف غير صحيح");
    }
  }, [phoneNumber, selectedCountry]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogTrigger>
            <div className="flex items-center gap-2 bg-primary p-2 rounded-md text-primary-foreground">
                <Phone className="size-4" />
                <span className="text-sm font-medium">
                تغيير رقم الهاتف
                </span>
            </div>
        </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Phone className="size-5" />
            رقم الهاتف
          </DialogTitle>
          <DialogDescription className="text-right">
            رقم الهاتف الخاص بالمتجر
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="country" className="text-right">
              رمز الدولة
            </Label>
            {selectedCountry ? (
              <div className="flex items-center justify-between p-3 border rounded-md bg-muted/50">
                <div className="flex items-center gap-2">
                  <span className="text-foreground">{selectedCountry.name.ar}</span>
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground font-medium">
                      +{selectedCountry.phoneCode}
                    </span>
                    <span className="text-muted-foreground text-xs">
                      ({selectedCountry.code2})
                    </span>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setCountryCodeDialogOpen(true)}
                  className="gap-2"
                >
                  <Globe className="size-4" />
                  تغيير
                </Button>
              </div>
            ) : (
              <Button
                type="button"
                variant="secondary"
                className="w-full justify-center gap-2"
                onClick={() => setCountryCodeDialogOpen(true)}
              >
                <Globe className="size-4" />
                اختر رمز الدولة
              </Button>
            )}
          </div>

          {selectedCountry && (
            <div className="space-y-2">
              <Label htmlFor="phoneNumber" className="text-right">
                رقم الهاتف
              </Label>
              <div className="relative">
                <Input
                  id="phoneNumber"
                  type="tel"
                  value={phoneNumber}
                  onChange={handlePhoneNumberChange}
                  placeholder="أدخل رقم الهاتف"
                  className="text-left pl-4"
                  required
                />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenChange(false)}
            >
              إلغاء
            </Button>

            {selectedCountry && (
              <>
                <Button onClick={(e) => {e.preventDefault(); handleValidate()}} className="gap-2">
                  <CheckCircle2 className="size-4" />
                  تحقق
                </Button>

                <Button type="submit" className="gap-2">
                  <Phone className="size-4" />
                  حفظ رقم الهاتف
                </Button>
              </>
            )}
          </DialogFooter>
        </form>
      </DialogContent>

      {/* Country Code Selection Dialog */}
      <CountryCodeDialog
        open={countryCodeDialogOpen}
        onOpenChange={setCountryCodeDialogOpen}
        onCountryCodeSelect={handleCountryCodeSelect}
        initialPhoneCode={selectedCountry?.phoneCode}
      />
    </Dialog>
  );
};

export default PhoneNumberDialog;