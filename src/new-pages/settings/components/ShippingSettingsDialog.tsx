import { useState } from "react";
import { Settings2, X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useFetchStoreDetails } from "@/api/wrappers/store.wrappers";
import { isPrimeDelivery } from "@/api/types/store";
import BranchLocationField from "./BranchLocationField";
import PrimeIntegrationCard from "./PrimeIntegrationCard";
import CourierAccountCard from "./CourierAccountCard";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

/**
 * إعدادات شركة التوصيل — everything about the store's courier integration,
 * behind the gear on the delivery card rather than stacked on the page:
 * the branch location (which opens the branch at Prime/Boxy), Prime's
 * checklist, and the store's account at the courier.
 */
const ShippingSettingsDialog = ({ open, onOpenChange }: Props) => {
  const { data: storeDetails } = useFetchStoreDetails();
  const companyName = storeDetails?.deliveryCompany?.name;
  const [locationOpen, setLocationOpen] = useState(false);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) setLocationOpen(false);
        onOpenChange(next);
      }}
    >
      <DialogContent
        dir="rtl"
        showCloseButton={false}
        className="max-h-[90vh] gap-0 overflow-hidden rounded-3xl border-0 bg-white p-0 sm:max-w-lg dark:bg-slate-950"
      >
        <div className="max-h-[90vh] overflow-y-auto p-5 sm:p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="flex size-10 items-center justify-center rounded-2xl bg-sky-100 text-[#00b7ff] dark:bg-sky-950/50 dark:text-sky-300">
                <Settings2 className="size-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-[#1a2b5a] dark:text-slate-50">
                  إعدادات التوصيل
                </DialogTitle>
                {companyName && (
                  <p className="text-[12px] text-slate-500">{companyName}</p>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="flex size-9 items-center justify-center rounded-xl bg-violet-100 text-[#1a2b5a] hover:bg-violet-200 dark:bg-violet-950/60 dark:text-violet-200"
              aria-label="إغلاق"
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="space-y-4">
            {isPrimeDelivery(storeDetails) ? (
              <PrimeIntegrationCard
                onOpenLocation={() => setLocationOpen(true)}
                onRequestPhone={() => onOpenChange(false)}
              />
            ) : null}

            <BranchLocationField
              open={locationOpen}
              onOpenChange={setLocationOpen}
            />

            {/* Whether the store can ship at all, and the own-login link for
                the two couriers that accept one. */}
            <CourierAccountCard embedded />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShippingSettingsDialog;
