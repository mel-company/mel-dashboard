import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DashedTag,
  ProductSectionCard,
  PurpleAddButton,
} from "@/components/product/tags";

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
      title="خيارات المنتج الأساسي"
      description="أضف خيارات المنتج (كاللون، المقاس، أو المادة)"
      action={<PurpleAddButton onClick={onAddOption} label="اضافة خيار جديد" />}
    >
      {options.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">
          لا توجد خيارات — اضغط + لإضافة خيار
        </p>
      ) : (
        <div className="space-y-3.5" dir="rtl">
          {options.map((option, optionIndex) => {
            const filledValues = option.values
              .map((v, i) => ({ ...v, index: i }))
              .filter((v) => v.value.trim());
            const isEditing = editingIndex === optionIndex;

            return (
              <div
                key={optionIndex}
                className="group flex flex-wrap items-center gap-2"
              >
                <div className="flex shrink-0 items-center gap-0.5">
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
                      className="text-sm font-semibold text-sky-500 dark:text-sky-400"
                    >
                      {option.name}
                    </button>
                  ) : (
                    <input
                      autoFocus
                      value={option.name}
                      onChange={(e) =>
                        onChangeOptionName(optionIndex, e.target.value)
                      }
                      placeholder="اسم الخيار"
                      className="w-20 rounded-lg border border-dashed border-sky-300 bg-transparent px-2 py-1 text-right text-sm font-semibold text-sky-500 outline-none"
                    />
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-6 opacity-0 text-slate-300 transition-opacity hover:text-destructive group-hover:opacity-100"
                    onClick={() => onRemoveOption(optionIndex)}
                    title="حذف الخيار"
                  >
                    <Trash2 className="size-3" />
                  </Button>
                </div>

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
                    className="rounded-full border border-dashed border-slate-300 px-2 py-0.5 text-xs text-slate-400 hover:border-violet-400 hover:text-violet-600"
                    title="إضافة قيمة"
                  >
                    +
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </ProductSectionCard>
  );
}
