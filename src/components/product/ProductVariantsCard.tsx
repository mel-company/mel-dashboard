import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DashedTag, ProductSectionCard } from "@/components/product/tags";
import type { ProductOption } from "@/components/product/ProductOptionsCard";

export type VariantDraft = {
  selectedOptionValues: Array<{ optionName: string; value: string }>;
  sku: string;
  qr_code: string;
  price?: string;
  stock: string;
  image?: string;
};

const fieldClass =
  "w-full rounded-2xl border-0 bg-white px-3 py-2.5 text-right text-sm outline-none ring-sky-300 placeholder:text-muted-foreground focus:ring-2 dark:bg-slate-950";

type ProductVariantsCardProps = {
  options: ProductOption[];
  variants: VariantDraft[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  onChange: (
    index: number,
    field: "sku" | "qr_code" | "price" | "stock" | "image",
    value: string,
  ) => void;
  onToggleOptionValue: (
    variantIndex: number,
    optionName: string,
    value: string,
  ) => void;
};

/** صف الموكاب: تسمية يمين + وسوم متقطعة بدون x */
function DimensionRow({
  name,
  values,
}: {
  name: string;
  values: Array<{ key: string; label: string }>;
}) {
  return (
    <div
      dir="rtl"
      className="flex flex-wrap items-center gap-2 rounded-2xl bg-[#f3ebff] px-3 py-2.5 dark:bg-violet-950/40"
    >
      <span className="shrink-0 text-sm font-semibold text-[#1a2b5a] dark:text-blue-100">
        {name}:
      </span>
      <div className="flex flex-wrap items-center gap-2">
        {values.map((val) => (
          <DashedTag key={val.key}>{val.label}</DashedTag>
        ))}
      </div>
    </div>
  );
}

export function ProductVariantsCard({
  options,
  variants,
  onAdd,
  onRemove,
  onChange,
  onToggleOptionValue,
}: ProductVariantsCardProps) {
  const dimensionRows = options
    .map((opt) => ({
      name: opt.name.trim(),
      values: opt.values
        .filter((v) => v.value.trim())
        .map((v) => ({
          key: v.value,
          label: v.label.trim() || v.value.trim(),
        })),
    }))
    .filter((row) => row.name && row.values.length > 0);

  const validOptions = options.filter(
    (opt) => opt.name.trim() && opt.values.some((v) => v.value.trim()),
  );

  return (
    <ProductSectionCard
      title="المتغيرات"
      description="أضف خيارات المنتج (كاللون، المقاس، أو المادة)"
      action={
        validOptions.length > 0 ? (
          <Button
            type="button"
            size="sm"
            className="gap-1 rounded-full"
            onClick={onAdd}
          >
            <Plus className="size-3" />
            اضافة متغير جديد
          </Button>
        ) : undefined
      }
    >
      <div dir="rtl" className="space-y-3 text-right">
        {dimensionRows.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            أضف خيارات أولاً لعرض أبعاد المتغيرات هنا
          </p>
        ) : (
          <div className="space-y-2.5">
            {dimensionRows.map((row) => (
              <DimensionRow
                key={row.name}
                name={row.name}
                values={row.values}
              />
            ))}
          </div>
        )}

        {variants.length > 0 && (
          <div className="space-y-3 border-t border-slate-100 pt-3 dark:border-slate-800">
            {variants.map((variant, variantIndex) => (
              <div
                key={variantIndex}
                className="space-y-3 rounded-2xl bg-[#f3ebff]/70 p-3 dark:bg-violet-950/25"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-[#1a2b5a] dark:text-blue-100">
                    متغير #{variantIndex + 1}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-8 shrink-0 text-destructive"
                    onClick={() => onRemove(variantIndex)}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>

                {validOptions.map((option) => {
                  const selectedValue = variant.selectedOptionValues.find(
                    (ov) => ov.optionName === option.name,
                  )?.value;
                  return (
                    <div
                      key={option.name}
                      className="flex flex-wrap items-center gap-2"
                    >
                      <span className="shrink-0 text-sm font-semibold text-[#1a2b5a] dark:text-blue-100">
                        {option.name}:
                      </span>
                      <div className="flex flex-wrap items-center gap-2">
                        {option.values
                          .filter((v) => v.value.trim())
                          .map((val) => (
                            <button
                              key={val.value}
                              type="button"
                              onClick={() =>
                                onToggleOptionValue(
                                  variantIndex,
                                  option.name,
                                  val.value,
                                )
                              }
                              className={cn(
                                "rounded-full border border-dashed px-3 py-1 text-xs",
                                selectedValue === val.value
                                  ? "border-violet-400 bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-200"
                                  : "border-slate-300 bg-white text-slate-600 dark:border-slate-600 dark:bg-slate-950",
                              )}
                            >
                              {val.label || val.value}
                            </button>
                          ))}
                      </div>
                    </div>
                  );
                })}

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <input
                    value={variant.sku}
                    onChange={(e) =>
                      onChange(variantIndex, "sku", e.target.value)
                    }
                    placeholder="SKU *"
                    className={fieldClass}
                    dir="ltr"
                  />
                  <input
                    value={variant.qr_code}
                    onChange={(e) =>
                      onChange(variantIndex, "qr_code", e.target.value)
                    }
                    placeholder="QR *"
                    className={fieldClass}
                    dir="ltr"
                  />
                  <input
                    type="number"
                    value={variant.price}
                    onChange={(e) =>
                      onChange(variantIndex, "price", e.target.value)
                    }
                    placeholder="السعر"
                    className={fieldClass}
                  />
                  <input
                    type="number"
                    value={variant.stock}
                    onChange={(e) =>
                      onChange(variantIndex, "stock", e.target.value)
                    }
                    placeholder="المخزون"
                    className={fieldClass}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ProductSectionCard>
  );
}
