import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashedTag, ProductSectionCard } from "@/components/product/tags";

export type OptionValue = { value: string; label: string };
export type ProductOption = {
  name: string;
  values: OptionValue[];
};

type ProductOptionsCardProps = {
  options: ProductOption[];
  onAddOption: () => void;
  onRemoveOption: (index: number) => void;
  onChangeOptionName: (index: number, name: string) => void;
  onAddValue: (optionIndex: number, text?: string) => void;
  onRemoveValue: (optionIndex: number, valueIndex: number) => void;
  onChangeValue: (
    optionIndex: number,
    valueIndex: number,
    field: "value" | "label",
    value: string,
  ) => void;
  onAddVariantClick?: () => void;
  variantAddedFor?: number[];
};

export function ProductOptionsCard({
  options,
  onAddOption,
  onRemoveOption,
  onChangeOptionName,
  onAddValue,
  onRemoveValue,
  onAddVariantClick,
  variantAddedFor = [],
}: ProductOptionsCardProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [draftValue, setDraftValue] = useState("");

  const commitDraft = (optionIndex: number) => {
    const trimmed = draftValue.trim();
    if (trimmed) onAddValue(optionIndex, trimmed);
    setDraftValue("");
    setEditingIndex(null);
  };

  return (
    <ProductSectionCard
      title="خيارات المنتج"
      description="أضف خيارات المنتج (كاللون، المقاس، أو المادة)"
      action={
        <Button
          type="button"
          size="sm"
          className="gap-1 rounded-full"
          onClick={onAddOption}
        >
          <Plus className="size-3" />
          اضافة خيار جديد
        </Button>
      }
    >
      {options.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          لا توجد خيارات — اضغط اضافة خيار جديد
        </p>
      ) : (
        <div className="space-y-5">
          {options.map((option, optionIndex) => {
            const filledValues = option.values
              .map((v, i) => ({ ...v, index: i }))
              .filter((v) => v.value.trim());
            const isAdded = variantAddedFor.includes(optionIndex);
            const isEditing = editingIndex === optionIndex;

            return (
              <div
                key={optionIndex}
                dir="rtl"
                className="grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2"
              >
                {/* العمود الأيمن: اسم الخيار */}
                <div className="shrink-0">
                  {option.name.trim() ? (
                    <button
                      type="button"
                      title="تعديل الاسم"
                      onClick={() => {
                        const next = window.prompt(
                          "تعديل اسم الخيار",
                          option.name,
                        );
                        if (next != null) {
                          onChangeOptionName(optionIndex, next);
                        }
                      }}
                      className="text-sm font-semibold text-[#1a2b5a] dark:text-blue-100"
                    >
                      {option.name}:
                    </button>
                  ) : (
                    <input
                      autoFocus
                      value={option.name}
                      onChange={(e) =>
                        onChangeOptionName(optionIndex, e.target.value)
                      }
                      placeholder="اسم الخيار"
                      className="w-24 rounded-lg border border-dashed border-slate-300 bg-transparent px-2 py-1 text-right text-sm font-semibold text-[#1a2b5a] outline-none"
                    />
                  )}
                </div>

                {/* الوسط: الوسوم */}
                <div className="flex min-w-0 flex-wrap items-center justify-start gap-2">
                  {filledValues.map((val) => (
                    <DashedTag
                      key={`${val.value}-${val.index}`}
                      onRemove={() => onRemoveValue(optionIndex, val.index)}
                    >
                      {val.label || val.value}
                    </DashedTag>
                  ))}

                  {isEditing ? (
                    <input
                      autoFocus
                      value={draftValue}
                      onChange={(e) => setDraftValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          commitDraft(optionIndex);
                        }
                        if (e.key === "Escape") {
                          setEditingIndex(null);
                          setDraftValue("");
                        }
                      }}
                      onBlur={() => commitDraft(optionIndex)}
                      placeholder="قيمة"
                      className="w-20 rounded-full border border-dashed border-violet-300 bg-white px-2.5 py-1 text-xs outline-none"
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingIndex(optionIndex);
                        setDraftValue("");
                      }}
                      className="rounded-full border border-dashed border-[#c5d0dc] px-2 py-0.5 text-xs text-slate-400 hover:border-violet-400 hover:text-violet-600"
                      title="إضافة قيمة"
                    >
                      +
                    </button>
                  )}
                </div>

                {/* العمود الأيسر: اضافة متغير */}
                <div className="flex shrink-0 items-center gap-2">
                  {onAddVariantClick ? (
                    <button
                      type="button"
                      onClick={onAddVariantClick}
                      className="whitespace-nowrap text-xs font-semibold text-[#7c3aed] underline underline-offset-2 dark:text-violet-400"
                    >
                      {isAdded ? "تم اضافة متغير" : "اضافة متغير"}
                    </button>
                  ) : (
                    <span className="w-0" />
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-7 text-slate-400 hover:text-destructive"
                    onClick={() => onRemoveOption(optionIndex)}
                    title="حذف الخيار"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </ProductSectionCard>
  );
}
