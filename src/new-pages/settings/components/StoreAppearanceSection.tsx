import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import SettingsCard from "./SettingsCard";

const templates = [
  {
    id: "classic",
    name: "القالب الكلاسيكي",
    description:
      "قالب مخصص لعرض المنتجات بطريقة المعتادة مع لمسات ميل المميزة",
  },
  {
    id: "simple",
    name: "القالب البساطة",
    description:
      "يركز القالب على ابراز المنتجات مع تقليل مشتتات بصرية في التصميم",
  },
  {
    id: "luxury",
    name: "القالب الفخامة",
    description:
      "يركز القالب على ابراز العلامة التجارية للمتجر مع اسلوب طرح منتجات مختلف",
  },
];

const StoreAppearanceSection = () => {
  const [activeTemplate, setActiveTemplate] = useState("classic");

  return (
    <SettingsCard title="مظهر المتجر">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {templates.map((template) => {
          const isActive = activeTemplate === template.id;

          return (
            <div
              key={template.id}
              className={cn(
                "rounded-[18px] p-[3px] transition-shadow",
                isActive
                  ? "bg-linear-to-br from-cyan-400 to-violet-500 shadow-md"
                  : "bg-transparent",
              )}
            >
              <div
                className={cn(
                  "relative flex h-full flex-col items-center gap-2 rounded-[15px] p-2",
                  isActive
                    ? "bg-violet-500/5 dark:bg-violet-500/10"
                    : "bg-transparent",
                )}
              >
                <div className="relative w-full">
                  <div className="h-[116px] w-full rounded-[10px] bg-white shadow-sm dark:bg-slate-800" />
                  <Button
                    type="button"
                    size="sm"
                    className={cn(
                      "absolute bottom-2 left-1/2 h-8 -translate-x-1/2 rounded-lg px-4 text-[13px] font-medium shadow-none",
                      isActive
                        ? "w-[186px] bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/10"
                        : "bg-sky-500/10 text-sky-500 hover:bg-sky-500/20",
                    )}
                    onClick={() => setActiveTemplate(template.id)}
                  >
                    {isActive ? "القالب الحالي" : "معاينة الشكل"}
                  </Button>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTemplate(template.id)}
                  className="w-full space-y-1 text-center"
                >
                  <p
                    className={cn(
                      "text-[15px] text-slate-700 dark:text-slate-100",
                      isActive ? "font-bold" : "font-normal",
                    )}
                  >
                    {template.name}
                  </p>
                  <p className="text-[10px] leading-relaxed text-slate-500 dark:text-slate-400">
                    {template.description}
                  </p>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </SettingsCard>
  );
};

export default StoreAppearanceSection;
