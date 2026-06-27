import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Eye, FileText, Upload } from "lucide-react";
import SettingsCard from "./SettingsCard";
import TermsAndConditionsSettings from "@/pages/settings/TermsAndConditionsSettings";
import PrivacyPolicySettings from "@/pages/settings/PrivacyPolicySettings";
import RefundPolicySettings from "@/pages/settings/RefundPolicySettings";

type PolicyKey = "terms" | "privacy" | "refund";

const policies: {
  key: PolicyKey;
  label: string;
  description: string;
  iconClass: string;
  Component: React.ComponentType;
  mode: "pdf" | "upload";
}[] = [
  {
    key: "terms",
    label: "الشروط والأحكام",
    description: "القواعد والشروط التي يوافق عليها العملاء",
    iconClass: "text-red-500",
    Component: TermsAndConditionsSettings,
    mode: "pdf",
  },
  {
    key: "privacy",
    label: "سياسة الخصوصية",
    description: "كيفية جمع واستخدام بيانات العملاء",
    iconClass: "text-red-500",
    Component: PrivacyPolicySettings,
    mode: "pdf",
  },
  {
    key: "refund",
    label: "سياسة الاسترداد",
    description: "شروط إرجاع المنتجات واسترداد المبالغ",
    iconClass: "text-orange-500",
    Component: RefundPolicySettings,
    mode: "upload",
  },
];

const PoliciesSection = () => {
  const [openPolicy, setOpenPolicy] = useState<PolicyKey | null>(null);
  const active = policies.find((p) => p.key === openPolicy);

  return (
    <>
      <SettingsCard title="سياسة المتجر">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {policies.map((policy) => (
            <div
              key={policy.key}
              className="flex flex-col items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/80 p-5 text-center"
            >
              <FileText className={`size-10 ${policy.iconClass}`} />

              <div className="space-y-1">
                <p className="font-bold text-blue-950">{policy.label}</p>
                <p className="text-xs leading-relaxed text-slate-500">
                  {policy.description}
                </p>
              </div>

              {policy.mode === "pdf" ? (
                <div className="flex w-full flex-col gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full gap-1 rounded-full"
                    onClick={() => setOpenPolicy(policy.key)}
                  >
                    <Eye className="size-3.5" />
                    معاينة الملف
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    className="w-full gap-1 rounded-full bg-violet-100 text-violet-700 hover:bg-violet-200"
                    onClick={() => setOpenPolicy(policy.key)}
                  >
                    <Upload className="size-3.5" />
                    تغيير الملف المرفوع
                  </Button>
                </div>
              ) : (
                <Button
                  type="button"
                  size="sm"
                  className="w-full gap-1 rounded-full bg-violet-100 text-violet-700 hover:bg-violet-200"
                  onClick={() => setOpenPolicy(policy.key)}
                >
                  <Upload className="size-3.5" />
                  تحميل الملف
                </Button>
              )}
            </div>
          ))}
        </div>
      </SettingsCard>

      <Dialog
        open={openPolicy !== null}
        onOpenChange={(open) => !open && setOpenPolicy(null)}
      >
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
          {active && <active.Component />}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PoliciesSection;
