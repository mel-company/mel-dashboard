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
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {templates.map((template) => {
          const isActive = activeTemplate === template.id;

          return (
            <div
              key={template.id}
              className={cn(
                "rounded-2xl p-[2px] transition-shadow",
                isActive
                  ? "bg-linear-to-r from-cyan-400 to-violet-500 shadow-md"
                  : "bg-slate-200/60 dark:bg-slate-800",
              )}
            >
              <div className="flex h-full flex-col rounded-[14px] bg-slate-50/80 p-3 dark:bg-slate-900/50">
                <div className="relative mb-3">
                  <div className="aspect-[4/3] w-full rounded-xl bg-white shadow-sm dark:bg-slate-800" />
                  <Button
                    type="button"
                    size="sm"
                    className={cn(
                      "absolute bottom-2 left-1/2 -translate-x-1/2 rounded-lg px-3 text-xs font-medium",
                      isActive
                        ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
                        : "bg-sky-100 text-sky-600 hover:bg-sky-200",
                    )}
                    onClick={() => setActiveTemplate(template.id)}
                  >
                    {isActive ? "تم اختيار القالب" : "معاينة الشكل"}
                  </Button>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTemplate(template.id)}
                  className="space-y-1 text-right"
                >
                  <p className="font-bold text-blue-950 dark:text-blue-100">
                    {template.name}
                  </p>
                  <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
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
