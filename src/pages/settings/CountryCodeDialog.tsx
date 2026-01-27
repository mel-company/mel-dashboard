import { useFetchPhoneCodes, type Country } from "@/api/wrappers/country.wrappers";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Phone, Loader2 } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCountryCodeSelect: (country: Country) => void;
  initialPhoneCode?: string;
};

const CountryCodeDialog = ({
  open,
  onOpenChange,
  onCountryCodeSelect,
  initialPhoneCode,
}: Props) => {
  // Only fetch when dialog is open
  const { data: phoneCodes, isLoading } = useFetchPhoneCodes(open, "ar");
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Filter out countries with empty or invalid phoneCode values
  const validPhoneCodes = useMemo(() => {
    if (!phoneCodes || !Array.isArray(phoneCodes)) return [];
    return phoneCodes.filter(
      (country: Country) =>
        country.phoneCode &&
        country.phoneCode.trim() !== "" &&
        country.code2 &&
        country.name?.ar
    );
  }, [phoneCodes]);

  // Filter countries based on search query
  const filteredPhoneCodes = useMemo(() => {
    if (!searchQuery.trim()) return validPhoneCodes;
    const query = searchQuery.toLowerCase().trim();
    return validPhoneCodes.filter(
      (country: Country) =>
        country.name.ar.toLowerCase().includes(query) ||
        country.name.en.toLowerCase().includes(query) ||
        country.code2.toLowerCase().includes(query) ||
        country.phoneCode.includes(query)
    );
  }, [validPhoneCodes, searchQuery]);

  // Memoize selected country to avoid recalculation on every render
  const selectedCountry = useMemo(() => {
    if (!validPhoneCodes.length || !selectedCountryCode) return null;
    return validPhoneCodes.find(
      (country: Country) => country.phoneCode === selectedCountryCode
    ) || null;
  }, [validPhoneCodes, selectedCountryCode]);

  // Initialize form when dialog opens or data loads
  useEffect(() => {
    if (open && validPhoneCodes.length > 0) {
      // Set initial value if provided
      if (initialPhoneCode) {
        setSelectedCountryCode(initialPhoneCode);
      } else {
        // Default to Iraq (+964) if available
        const iraq = validPhoneCodes.find(
          (country: Country) => country.phoneCode === "964"
        );
        if (iraq) {
          setSelectedCountryCode(iraq.phoneCode);
        } else if (validPhoneCodes.length > 0) {
          setSelectedCountryCode(validPhoneCodes[0].phoneCode);
        }
      }
      setSearchQuery("");
    }
  }, [open, validPhoneCodes, initialPhoneCode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCountryCode) {
      toast.error("يرجى اختيار رمز الدولة");
      return;
    }

    // Call the callback with selected country data
    if (selectedCountry) {
      onCountryCodeSelect(selectedCountry);
      // Close dialog
      onOpenChange(false);
      toast.success("تم اختيار رمز الدولة بنجاح");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Phone className="size-5" />
            اختيار رمز الدولة
          </DialogTitle>
          <DialogDescription className="text-right">
            اختر رمز الدولة الخاص برقم الهاتف
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Country Select */}
          <div className="space-y-2">
            <Label htmlFor="country" className="text-right">
              رمز الدولة
            </Label>
            {isLoading ? (
              <div className="flex items-center justify-center h-10 border rounded-md">
                <Loader2 className="size-4 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <Select
                value={selectedCountryCode}
                onValueChange={setSelectedCountryCode}
              >
                <SelectTrigger className="w-full text-right" id="country">
                  <SelectValue placeholder="اختر رمز الدولة">
                    {selectedCountry && (
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <span className="text-muted-foreground text-xs">
                            ({selectedCountry.code2})
                          </span>
                          <span className="text-muted-foreground">
                            +{selectedCountry.phoneCode}
                          </span>
                        </div>
                        <span>{selectedCountry.name.ar}</span>
                      </div>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {filteredPhoneCodes.length > 0 ? (
                    filteredPhoneCodes.map((country: Country) => (
                      <SelectItem
                        key={country.code2}
                        value={country.phoneCode}
                        className="text-right"
                      >
                        <div className="flex items-center justify-between w-full gap-4">
                          <span className="min-w-20 text-muted-foreground">
                            ({country.code2}) +{country.phoneCode}
                          </span>
                          <span className="flex-1 text-right">
                            {country.name.ar}
                          </span>
                        </div>
                      </SelectItem>
                    ))
                  ) : (
                    <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                      لا توجد نتائج
                    </div>
                  )}
                </SelectContent>
              </Select>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenChange(false)}
            >
              إلغاء
            </Button>
            <Button type="submit" className="gap-2">
              <Phone className="size-4" />
              تأكيد
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CountryCodeDialog;
