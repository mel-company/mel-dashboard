import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useFetchStoreDetails } from "@/api/wrappers/store.wrappers";
import {
  useFetchCurrentSettings,
  useUpdateCurrentSettings,
  useUpdateGeneralSettings,
  useUpdateStoreDetails,
} from "@/api/wrappers/settings.wrappers";
import { PRODUCT_STATUS } from "@/utils/constants";
import { sanitizePhoneNumber } from "@/utils/helpers";

export type SettingsTab = "general" | "store";

export interface StoreFormData {
  storeName: string;
  storeDescription: string;
  businessEmail: string;
  businessPhone: string;
  physicalAddress: string;
  isPhysicalStore: boolean;
  latitude: number | null;
  longitude: number | null;
  workStartTime: string;
  workEndTime: string;
  estimatedDeliveryDays: number;
  deliveryNotes: string;
  defaultProductStatus: string;
  lowStockThreshold: number;
  cashOnDelivery: boolean;
  allowOrderEditing: boolean;
  autoCancelUnpaidHours: number;
}

const defaultStoreForm: StoreFormData = {
  storeName: "",
  storeDescription: "",
  businessEmail: "",
  businessPhone: "",
  physicalAddress: "",
  isPhysicalStore: false,
  latitude: null,
  longitude: null,
  workStartTime: "10:00",
  workEndTime: "22:00",
  estimatedDeliveryDays: 10,
  deliveryNotes: "",
  defaultProductStatus: PRODUCT_STATUS.PUBLISHED,
  lowStockThreshold: 10,
  cashOnDelivery: true,
  allowOrderEditing: true,
  autoCancelUnpaidHours: 10,
};

export function useSettingsPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const activeTab: SettingsTab = location.pathname.includes("/settings/store")
    ? "store"
    : "general";

  const { data: storeDetails, isLoading: isLoadingStore } =
    useFetchStoreDetails();
  const { data: currentSettings, isLoading: isLoadingSettings } =
    useFetchCurrentSettings();

  const { mutate: updateStoreDetails, isPending: isSavingStore } =
    useUpdateStoreDetails();
  const { mutate: updateSettings, isPending: isSavingSettings } =
    useUpdateCurrentSettings();
  const updateGeneralSettingsMutation = useUpdateGeneralSettings();

  const [storeForm, setStoreForm] = useState<StoreFormData>(defaultStoreForm);
  const [logoDialogOpen, setLogoDialogOpen] = useState(false);
  const [locationDialogOpen, setLocationDialogOpen] = useState(false);
  const originalStoreFormRef = useRef<StoreFormData | null>(null);

  const [generalSettings, setGeneralSettings] = useState({
    defaultProductStatus: PRODUCT_STATUS.DRAFT,
    lowStockThreshold: 10,
    autoCancelUnpaidHours: 24,
    allowOrderEditing: false,
    maintenanceMode: false,
  });
  const originalGeneralRef = useRef<typeof generalSettings | null>(null);

  useEffect(() => {
    if (!storeDetails && currentSettings === undefined) return;

    const next: StoreFormData = {
      storeName: storeDetails?.name ?? "",
      storeDescription: storeDetails?.description ?? "",
      businessEmail: storeDetails?.email ?? "",
      businessPhone: storeDetails?.phone ?? "",
      physicalAddress: storeDetails?.location ?? "",
      isPhysicalStore: storeDetails?.is_physical_store ?? false,
      latitude: storeDetails?.latitude ?? null,
      longitude: storeDetails?.longitude ?? null,
      workStartTime: storeDetails?.work_start_time ?? "10:00",
      workEndTime: storeDetails?.work_end_time ?? "22:00",
      estimatedDeliveryDays: currentSettings?.estimated_delivery_days ?? 10,
      deliveryNotes: currentSettings?.delivery_notes ?? "",
      defaultProductStatus:
        currentSettings?.product_default_state?.toUpperCase() ??
        PRODUCT_STATUS.PUBLISHED,
      lowStockThreshold: currentSettings?.low_stock_alert ?? 10,
      cashOnDelivery: currentSettings?.cash_on_delivery ?? true,
      allowOrderEditing: currentSettings?.allow_edit_order ?? true,
      autoCancelUnpaidHours: currentSettings?.cancel_order_after_hours ?? 10,
    };

    setStoreForm(next);
    originalStoreFormRef.current = JSON.parse(JSON.stringify(next));
  }, [storeDetails, currentSettings]);

  useEffect(() => {
    if (!currentSettings) return;

    const next = {
      defaultProductStatus:
        currentSettings.product_default_state?.toUpperCase() ||
        PRODUCT_STATUS.DRAFT,
      lowStockThreshold: currentSettings.low_stock_alert ?? 10,
      autoCancelUnpaidHours: currentSettings.cancel_order_after_hours ?? 24,
      allowOrderEditing: currentSettings.allow_edit_order ?? false,
      maintenanceMode: currentSettings.under_maintenance ?? false,
    };

    setGeneralSettings(next);
    originalGeneralRef.current = JSON.parse(JSON.stringify(next));
  }, [currentSettings]);

  const handleTabChange = useCallback(
    (tab: SettingsTab) => {
      navigate(tab === "store" ? "/settings/store" : "/settings/general");
    },
    [navigate],
  );

  const updateStoreField = useCallback(
    <K extends keyof StoreFormData>(key: K, value: StoreFormData[K]) => {
      setStoreForm((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const updateStoreLocation = useCallback(
    (data: { latitude: number; longitude: number; address: string }) => {
      setStoreForm((prev) => ({
        ...prev,
        latitude: data.latitude,
        longitude: data.longitude,
        physicalAddress: data.address,
      }));
    },
    [],
  );

  const handleStoreInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setStoreForm((prev) => ({
        ...prev,
        [name]:
          name === "estimatedDeliveryDays" ||
          name === "lowStockThreshold" ||
          name === "autoCancelUnpaidHours"
            ? parseInt(value) || 0
            : value,
      }));
    },
    [],
  );

  const hasStoreChanges = useMemo(() => {
    if (!originalStoreFormRef.current) return false;
    return (
      JSON.stringify(originalStoreFormRef.current) !== JSON.stringify(storeForm)
    );
  }, [storeForm]);

  const hasGeneralChanges = useMemo(() => {
    if (!originalGeneralRef.current) return false;
    return (
      JSON.stringify(originalGeneralRef.current) !==
      JSON.stringify(generalSettings)
    );
  }, [generalSettings]);

  const saveStoreSettings = useCallback(() => {
    const updateData: Record<string, unknown> = {
      name: storeForm.storeName,
      description: storeForm.storeDescription,
      email: storeForm.businessEmail,
      location: storeForm.isPhysicalStore ? storeForm.physicalAddress : null,
      is_physical_store: storeForm.isPhysicalStore,
      latitude: storeForm.isPhysicalStore ? storeForm.latitude : null,
      longitude: storeForm.isPhysicalStore ? storeForm.longitude : null,
      work_start_time: storeForm.workStartTime || null,
      work_end_time: storeForm.workEndTime || null,
    };

    if (storeForm.businessPhone) {
      try {
        updateData.phone = sanitizePhoneNumber(storeForm.businessPhone, "+964");
      } catch (error: unknown) {
        const message =
          error instanceof Error
            ? error.message
            : "رقم الهاتف غير صحيح. يجب أن يبدأ بـ 7 ويتكون من 10 أرقام";
        toast.error(message);
        return;
      }
    }

    updateStoreDetails(updateData, {
      onSuccess: () => {
        updateSettings(
          {
            estimated_delivery_days: storeForm.estimatedDeliveryDays,
            delivery_notes: storeForm.deliveryNotes,
            product_default_state: storeForm.defaultProductStatus,
            low_stock_alert: storeForm.lowStockThreshold,
            cash_on_delivery: storeForm.cashOnDelivery,
            allow_edit_order: storeForm.allowOrderEditing,
            cancel_order_after_hours: storeForm.autoCancelUnpaidHours,
          },
          {
            onSuccess: () => {
              originalStoreFormRef.current = JSON.parse(
                JSON.stringify(storeForm),
              );
              toast.success("تم حفظ الإعدادات بنجاح");
            },
            onError: (error: { response?: { data?: { message?: string } } }) => {
              toast.error(
                error?.response?.data?.message ||
                  "حدث خطأ أثناء حفظ إعدادات المتجر",
              );
            },
          },
        );
      },
      onError: (error: { response?: { data?: { message?: string } } }) => {
        toast.error(
          error?.response?.data?.message ||
            "حدث خطأ أثناء حفظ معلومات المتجر",
        );
      },
    });
  }, [storeForm, updateStoreDetails, updateSettings]);

  const saveGeneralSettings = useCallback(async () => {
    try {
      await updateGeneralSettingsMutation.mutateAsync({
        product_default_state: generalSettings.defaultProductStatus.toUpperCase(),
        low_stock_alert: generalSettings.lowStockThreshold,
        cancel_order_after_hours: generalSettings.autoCancelUnpaidHours,
        allow_edit_order: generalSettings.allowOrderEditing,
        under_maintenance: generalSettings.maintenanceMode,
      });
      originalGeneralRef.current = JSON.parse(JSON.stringify(generalSettings));
      toast.success("تم حفظ الإعدادات بنجاح");
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(
        err?.response?.data?.message ||
          "حدث خطأ أثناء حفظ الإعدادات. يرجى المحاولة مرة أخرى.",
      );
    }
  }, [generalSettings, updateGeneralSettingsMutation]);

  const isLoading = isLoadingStore || isLoadingSettings;
  const isSaving =
    isSavingStore ||
    isSavingSettings ||
    updateGeneralSettingsMutation.isPending;

  return {
    activeTab,
    handleTabChange,
    storeForm,
    updateStoreField,
    handleStoreInputChange,
    generalSettings,
    setGeneralSettings,
    storeDetails,
    logoDialogOpen,
    setLogoDialogOpen,
    locationDialogOpen,
    setLocationDialogOpen,
    updateStoreLocation,
    hasStoreChanges,
    hasGeneralChanges,
    saveStoreSettings,
    saveGeneralSettings,
    isLoading,
    isSaving,
  };
}
