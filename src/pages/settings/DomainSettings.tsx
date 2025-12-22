import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Globe,
  Link2,
  Save,
  Info,
  InfoIcon,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";
import {
  useCheckDomainAvailability,
  useFindDomainDetails,
  useUpdateDomain,
} from "@/api/wrappers/domain.wrappers";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { isValidDomain } from "@/utils/helpers";

type Props = {};

const DomainSettings = ({}: Props) => {
  const { data: domainDetails, isLoading } = useFindDomainDetails();

  // Dialog state
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [newDomain, setNewDomain] = useState("");
  const [availabilityResult, setAvailabilityResult] = useState<{
    isAvailable: boolean | null;
    message: string;
  } | null>(null);

  // Calculate if 30 days have passed since last update
  const canUpdateDomain = useMemo(() => {
    if (!domainDetails?.domain_last_update) {
      return true; // If never updated, allow update
    }

    const lastUpdate = new Date(domainDetails.domain_last_update);
    const now = new Date();
    const daysSinceUpdate = Math.floor(
      (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24)
    );

    return daysSinceUpdate >= 30;
  }, [domainDetails?.domain_last_update]);

  // Format date for display
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "لم يتم التحديث";
    const date = new Date(dateString);
    return date.toLocaleDateString("ar-IQ", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Handle opening update dialog
  const handleOpenUpdateDialog = () => {
    if (!canUpdateDomain) {
      toast.error(
        "لا يمكن تحديث النطاق. يجب الانتظار 30 يومًا على الأقل من آخر تحديث."
      );
      return;
    }
    setNewDomain("");
    setAvailabilityResult(null);
    setIsUpdateDialogOpen(true);
  };

  const { mutate: checkDomainAvailability, isPending } =
    useCheckDomainAvailability();

  const { mutate: updateDomain, isPending: isUpdatingDomain } =
    useUpdateDomain();

  // Handle checking domain availability
  const handleCheckAvailability = () => {
    if (!newDomain.trim()) {
      toast.error("الرجاء إدخال نطاق للتحقق");
      return;
    }

    const trimmedDomain = newDomain.trim();

    // Validate domain format
    if (!isValidDomain(trimmedDomain)) {
      toast.error("صيغة النطاق غير صحيحة. يرجى مراجعة التعليمات");
      setAvailabilityResult({
        isAvailable: false,
        message: "صيغة النطاق غير صحيحة",
      });
      return;
    }

    setAvailabilityResult(null);

    checkDomainAvailability(trimmedDomain, {
      onSuccess: (result) => {
        setAvailabilityResult({
          isAvailable: result.isAvailable,
          message: result.isAvailable
            ? "النطاق متاح"
            : "النطاق غير متاح أو مستخدم بالفعل",
        });
        if (result.isAvailable) {
          toast.success("النطاق متاح");
        } else {
          toast.error("النطاق غير متاح");
        }
      },
      onError: (error: any) => {
        setAvailabilityResult({
          isAvailable: false,
          message: error?.response?.data?.message || "حدث خطأ أثناء التحقق",
        });
        toast.error("حدث خطأ أثناء التحقق من توفر النطاق");
      },
    });
  };

  // Handle clearing the input
  const handleClear = () => {
    setNewDomain("");
    setAvailabilityResult(null);
  };

  // Handle updating domain
  const handleUpdateDomain = () => {
    if (!newDomain.trim()) {
      toast.error("الرجاء إدخال نطاق للتحديث");
      return;
    }

    const trimmedDomain = newDomain.trim();

    // Validate domain format
    if (!isValidDomain(trimmedDomain)) {
      toast.error("صيغة النطاق غير صحيحة. يرجى مراجعة التعليمات");
      return;
    }

    if (!availabilityResult?.isAvailable) {
      toast.error("الرجاء التحقق من توفر النطاق أولاً");
      return;
    }

    updateDomain(trimmedDomain, {
      onSuccess: () => {
        toast.success("تم تحديث النطاق بنجاح");
        handleCloseDialog();
      },
      onError: (error: any) => {
        toast.error(
          error?.response?.data?.message || "حدث خطأ أثناء تحديث النطاق"
        );
      },
    });
  };

  // Handle closing dialog
  const handleCloseDialog = () => {
    setIsUpdateDialogOpen(false);
    setNewDomain("");
    setAvailabilityResult(null);
  };

  return (
    <div className="space-y-6 min-h-full pb-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">إعدادات النطاق</h1>
        <p className="text-muted-foreground mt-1">
          قم بتكوين النطاق وعناوين URL للمتجر
        </p>
      </div>

      <div className="space-y-6">
        {/* Subdomain */}
        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Globe className="size-5" />
              النطاق الحالي
            </CardTitle>

            <div className="flex gap-x-2 items-center">
              <Button
                variant="secondary"
                className="gap-2"
                onClick={handleOpenUpdateDialog}
                disabled={!canUpdateDomain}
              >
                تحديث النطاق
              </Button>
              <Link
                to={`https://${domainDetails?.domain || "mystore"}.mel.iq`}
                className="bg-primary flex items-center gap-2 p-2 rounded-md"
                target="_blank"
              >
                <p className="text-xs  text-blue-500">إنتقل للموقع</p>
                <Link2 className="size-4 text-blue-500" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Last Update Info */}

            {isLoading ? (
              <div className="p-2 bgmuted border-2 rounded-lg space-y-3 flex items-center justify-center">
                <Skeleton className="h-12 w-62 rounded-md" />
              </div>
            ) : (
              <div className="p-4 bg-muted border-2 rounded-lg space-y-3 flex items-center justify-center">
                <p className="text-2xl">{domainDetails?.domain}.mel.iq</p>
              </div>
            )}

            <div className="flex gap-x-2 items-center">
              <InfoIcon className="size-4 text-blue-600 dark:text-blue-400" />
              <Label className="text-sm">
                يمكنك تحديث النطاق الفرعي كل 30 يوم
              </Label>
            </div>
            <div className="flex gap-x-2 items-center">
              <InfoIcon className="size-4 text-blue-600 dark:text-blue-400" />
              <Label className="text-sm">
                تاريخ اخر تحديث: {formatDate(domainDetails?.domain_last_update)}
              </Label>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Update Domain Dialog */}
      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent className="max-w-2xl text-right">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Globe className="size-5" />
              تحديث النطاق الفرعي
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Input Field */}
            <div className="flex flex-col gap-y-2">
              <Label htmlFor="newDomain">النطاق الفرعي الجديد</Label>
              <div className="flex items-center border border-input rounded-md bg-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                <span className="px-3 py-2 bg-primary rounded-r-md border-r text-secondary border-input text-sm shrink-0">
                  mel.iq
                </span>
                <Input
                  id="newDomain"
                  value={newDomain}
                  onChange={(e) => {
                    const value = e.target.value;
                    setNewDomain(value);
                    // Clear availability result when user types
                    setAvailabilityResult(null);
                  }}
                  onBlur={(e) => {
                    // Validate on blur and show error if invalid
                    const value = e.target.value.trim();
                    if (value && !isValidDomain(value)) {
                      setAvailabilityResult({
                        isAvailable: false,
                        message: "صيغة النطاق غير صحيحة",
                      });
                    }
                  }}
                  placeholder="أدخل النطاق الفرعي الجديد"
                  className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-r-none"
                />
              </div>

              {/* Availability Result */}
              {availabilityResult && (
                <div
                  className={`p-3 rounded-md flex items-center gap-2 ${
                    availabilityResult.isAvailable
                      ? "bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800"
                      : "bg-destructive/10 border border-destructive/20"
                  }`}
                >
                  {availabilityResult.isAvailable ? (
                    <CheckCircle2 className="size-4 text-green-600 dark:text-green-400" />
                  ) : (
                    <XCircle className="size-4 text-destructive" />
                  )}
                  <p
                    className={`text-sm ${
                      availabilityResult.isAvailable
                        ? "text-green-700 dark:text-green-300"
                        : "text-destructive"
                    }`}
                  >
                    {availabilityResult.message}
                  </p>
                </div>
              )}
            </div>

            {/* Domain Selection Instructions */}
            <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg space-y-3">
              <div className="flex items-center gap-2">
                <Info className="size-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  التعليمات
                </span>
              </div>
              <ul className="space-y-2 pr-6 text-sm text-blue-800 dark:text-blue-200">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 dark:text-blue-400 mt-0.5">
                    •
                  </span>
                  <span>يجب أن يبدأ النطاق بحرف وليس برقم</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 dark:text-blue-400 mt-0.5">
                    •
                  </span>
                  <span>
                    لا تستخدم الرموز الخاصة مثل: / ? ! \ | @ # $ % ^ & * ( ) [ ]
                    {}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 dark:text-blue-400 mt-0.5">
                    •
                  </span>
                  <span>عدم استخدام المسافات</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 dark:text-blue-400 mt-0.5">
                    •
                  </span>
                  <span>لا تستخدم النقطة (.)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 dark:text-blue-400 mt-0.5">
                    •
                  </span>
                  <span>لا تستخدم الشرطة السفلية (_)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 dark:text-blue-400 mt-0.5">
                    •
                  </span>
                  <span>استخدم الأحرف والشرطة (-) فقط</span>
                </li>
              </ul>
              <div className="pt-2 border-t border-blue-200 dark:border-blue-800">
                <p className="text-xs text-blue-700 dark:text-blue-300 pr-6">
                  <span className="font-medium">أمثلة صحيحة:</span> mystore,
                  my-store, store123
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-300 pr-6 mt-1">
                  <span className="font-medium">أمثلة خاطئة:</span> 123store,
                  my_store, store.com
                </p>
              </div>
            </div>
          </div>

          <DialogFooter className="flex-row-reverse gap-2">
            <Button
              variant="secondary"
              onClick={handleCloseDialog}
              className="gap-2"
              disabled={isUpdatingDomain}
            >
              إغلاق
            </Button>
            <Button
              variant="secondary"
              onClick={handleClear}
              disabled={(!newDomain && !availabilityResult) || isUpdatingDomain}
              className="gap-2"
            >
              مسح
            </Button>
            {availabilityResult?.isAvailable ? (
              <Button
                onClick={handleUpdateDomain}
                disabled={isUpdatingDomain}
                className="gap-2"
              >
                {isUpdatingDomain ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    جاري التحديث...
                  </>
                ) : (
                  <>
                    <Save className="size-4" />
                    تحديث النطاق
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={handleCheckAvailability}
                disabled={!newDomain.trim() || isPending}
                className="gap-2"
              >
                {isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    جاري التحقق...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="size-4" />
                    التحقق من التوفر
                  </>
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DomainSettings;
