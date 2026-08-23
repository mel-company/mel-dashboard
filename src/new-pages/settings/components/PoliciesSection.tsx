import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import SettingsCard from "./SettingsCard";
import TermsAndConditionsSettings from "@/pages/settings/TermsAndConditionsSettings";
import PrivacyPolicySettings from "@/pages/settings/PrivacyPolicySettings";
import RefundPolicySettings from "@/pages/settings/RefundPolicySettings";
import pdfFileIcon from "@/assets/settings/pdf-file.svg";
import pdfFoldIcon from "@/assets/settings/pdf-fold.svg";
import fileUploadIcon from "@/assets/settings/file-upload.svg";

type PolicyKey = "terms" | "privacy" | "refund";

const PdfBadge = () => (
  <div className="relative h-16 w-12 shrink-0">
    <img src={pdfFileIcon} alt="" className="absolute inset-0 size-full" />
    <img
      src={pdfFoldIcon}
      alt=""
      className="absolute top-0 right-0 h-[32.5%] w-[43.3%]"
    />
    <span className="absolute bottom-[18%] left-1/2 -translate-x-1/2 text-[16px] font-bold uppercase tracking-tight text-white">
      pdf
    </span>
  </div>
);

const policies: {
  key: PolicyKey;
  label: string;
  description: string;
  Component: React.ComponentType;
  mode: "pdf" | "upload";
}[] = [
  {
    key: "terms",
    label: "الشروط والاحكام",
    description: "الشروط والأحكام التي يوافق عليها العملاء عند الشراء",
    Component: TermsAndConditionsSettings,
    mode: "pdf",
  },
  {
    key: "privacy",
    label: "سياسة الخصوصية",
    description: "كيفية جمع واستخدام بيانات العملاء",
    Component: PrivacyPolicySettings,
    mode: "pdf",
  },
  {
    key: "refund",
    label: "سياسة الاسترداد",
    description: "شروط إرجاع المنتجات واسترداد المبالغ",
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
        <div className="grid grid-cols-1 gap-2.5 md:grid-cols-3">
          {policies.map((policy) => (
            <div
              key={policy.key}
              className="flex flex-col items-center justify-end gap-3 rounded-2xl bg-slate-50 px-5 py-6 text-center dark:bg-slate-900"
            >
              {policy.mode === "pdf" ? (
                <PdfBadge />
              ) : (
                <img
                  src={fileUploadIcon}
                  alt=""
                  className="size-16 object-contain"
                />
              )}

              <div className="w-full space-y-2">
                <p className="text-lg font-bold text-slate-700 dark:text-slate-100">
                  {policy.label}
                </p>
                <p className="min-h-9 text-xs leading-[18px] text-slate-500">
                  {policy.description}
                </p>
              </div>

              {policy.mode === "pdf" ? (
                <div className="flex h-[88px] w-full flex-col gap-1">
                  <Button
                    type="button"
                    size="sm"
                    className="h-[42px] w-full gap-1.5 rounded-xl bg-violet-500/10 text-[13px] font-bold text-violet-600 hover:bg-violet-500/20"
                    onClick={() => setOpenPolicy(policy.key)}
                  >
                    معاينة الملف
                    <svg
                      viewBox="0 0 18 18"
                      className="size-[18px]"
                      fill="none"
                      aria-hidden
                    >
                      <path
                        d="M1.5 9s2.75-5.25 7.5-5.25S16.5 9 16.5 9s-2.75 5.25-7.5 5.25S1.5 9 1.5 9Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      />
                      <circle
                        cx="9"
                        cy="9"
                        r="2.25"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      />
                    </svg>
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-[42px] w-full text-[13px] font-bold text-sky-500 hover:bg-sky-500/10 hover:text-sky-600"
                    onClick={() => setOpenPolicy(policy.key)}
                  >
                    تغيير الملف المرفوع
                  </Button>
                </div>
              ) : (
                <div className="flex h-[88px] w-full flex-col">
                  <Button
                    type="button"
                    size="sm"
                    className="h-[42px] w-full gap-1.5 rounded-xl bg-violet-500/10 text-[13px] font-bold text-violet-600 hover:bg-violet-500/20"
                    onClick={() => setOpenPolicy(policy.key)}
                  >
                    تحميل الملف
                    <svg
                      viewBox="0 0 18 18"
                      className="size-[18px]"
                      fill="none"
                      aria-hidden
                    >
                      <path
                        d="M3 12.75v1.5A1.5 1.5 0 0 0 4.5 15.75h9a1.5 1.5 0 0 0 1.5-1.5v-1.5M12 6.75 9 3.75 6 6.75M9 3.75v9"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </Button>
                </div>
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
          {active ? <active.Component /> : null}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PoliciesSection;
