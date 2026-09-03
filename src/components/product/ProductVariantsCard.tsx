import { useRef } from "react";
import { ChevronsUpDown, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ProductSectionCard } from "@/components/product/tags";
import type { ProductOption } from "@/components/product/ProductOptionsCard";
import { formatCurrency } from "@/utils/format-currency";

export type VariantDraft = {
  selectedOptionValues: Array<{ optionName: string; value: string }>;
  sku: string;
  qr_code: string;
  price?: string;
  stock: string;
  image?: string;
};

const cellInput =
  "w-full bg-transparent px-1 py-1 text-center text-sm text-slate-700 outline-none placeholder:text-slate-300 focus:rounded-lg focus:bg-white focus:ring-2 focus:ring-sky-200 dark:text-slate-100 dark:placeholder:text-slate-600 dark:focus:bg-slate-950";

const purpleIconBtn =
  "flex size-9 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-600 transition-colors hover:bg-violet-200 dark:bg-violet-500/20 dark:text-violet-300 dark:hover:bg-violet-500/30";

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

function formatMoney(value?: string) {
  if (!value?.trim()) return "";
  const n = Number(value);
  if (Number.isNaN(n)) return value;
  return formatCurrency(n, "");
}

function optionValue(
  variant: VariantDraft,
  optionName: string,
): string | undefined {
  return variant.selectedOptionValues.find((ov) => ov.optionName === optionName)
    ?.value;
}

function SortHeader({ children }: { children: React.ReactNode }) {
  return (
    <th className="whitespace-nowrap px-3 py-3.5 text-center text-xs font-semibold text-slate-600 dark:text-slate-300">
      <span className="inline-flex items-center justify-center gap-1">
        {children}
        <ChevronsUpDown className="size-3.5 text-slate-300" strokeWidth={2} />
      </span>
    </th>
  );
}

function VariantImageCell({
  image,
  onPick,
}: {
  image?: string;
  onPick: (file: File) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onPick(file);
          e.target.value = "";
        }}
      />
      {image ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="block overflow-hidden rounded-xl"
        >
          <img
            src={image}
            alt=""
            className="size-10 rounded-xl object-cover"
          />
        </button>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={purpleIconBtn}
          aria-label="اضافة صورة"
        >
          <Plus className="size-4" strokeWidth={2.5} />
        </button>
      )}
    </>
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
  const validOptions = options.filter(
    (opt) => opt.name.trim() && opt.values.some((v) => v.value.trim()),
  );

  const colorOption =
    validOptions.find((o) => /لون|color/i.test(o.name)) ?? validOptions[0];
  const sizeOption =
    validOptions.find((o) => /حجم|مقاس|size/i.test(o.name)) ??
    validOptions.find((o) => o !== colorOption);

  const setOption = (
    variantIndex: number,
    option: ProductOption | undefined,
    next: string,
    variant: VariantDraft,
  ) => {
    if (!option) return;
    const current = optionValue(variant, option.name) ?? "";
    if (!next) {
      if (current) onToggleOptionValue(variantIndex, option.name, current);
      return;
    }
    onToggleOptionValue(variantIndex, option.name, next);
  };

  const pickImage = (variantIndex: number, file: File) => {
    const url = URL.createObjectURL(file);
    onChange(variantIndex, "image", url);
  };

  return (
    <ProductSectionCard
      title="المنتجات الفعلية"
      description="يمكنك تخصيص المنتج الاساسي الى منتجات فعلية تختلف بالخيارات والخصائص"
      action={
        <Button
          type="button"
          size="sm"
          className="h-10 gap-2 rounded-xl bg-violet-100 px-4 text-sm font-semibold text-violet-700 shadow-none hover:bg-violet-200 dark:bg-violet-500/20 dark:text-violet-200 dark:hover:bg-violet-500/30"
          onClick={onAdd}
        >
          <Plus className="size-4" strokeWidth={2.5} />
          اضافة منتج جديد
        </Button>
      }
    >
      {variants.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-8">
          <p className="text-center text-sm text-muted-foreground">
            {validOptions.length === 0
              ? "أضف خيارات من العمود الجانبي، أو أضف منتجاً فعلياً مباشرة"
              : "لا توجد منتجات فعلية — اضغط اضافة منتج جديد"}
          </p>
          <Button
            type="button"
            size="sm"
            className="h-10 gap-2 rounded-xl bg-violet-100 px-4 text-sm font-semibold text-violet-700 shadow-none hover:bg-violet-200"
            onClick={onAdd}
          >
            <Plus className="size-4" strokeWidth={2.5} />
            اضافة منتج جديد
          </Button>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div
            className="hidden overflow-hidden rounded-2xl border border-slate-100 md:block dark:border-slate-800"
            dir="rtl"
          >
            <div className="overflow-x-auto">
              <table className="w-full min-w-[920px] text-sm">
                <thead>
                  <tr className="bg-[#eef2f7] dark:bg-slate-900">
                    <SortHeader>KUS</SortHeader>
                    <SortHeader>QR</SortHeader>
                    <SortHeader>الكمية</SortHeader>
                    <SortHeader>السعر</SortHeader>
                    <SortHeader>اللون</SortHeader>
                    <SortHeader>الحجم</SortHeader>
                    <th className="whitespace-nowrap px-3 py-3.5 text-center text-xs font-semibold text-slate-600 dark:text-slate-300">
                      <span className="inline-flex items-center justify-center gap-1">
                        الصورة مخصصة
                        <ChevronsUpDown
                          className="size-3.5 text-slate-300"
                          strokeWidth={2}
                        />
                      </span>
                    </th>
                    <th className="whitespace-nowrap px-3 py-3.5 text-center text-xs font-semibold text-slate-600 dark:text-slate-300">
                      العمليات
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {variants.map((variant, variantIndex) => (
                    <tr
                      key={variantIndex}
                      className="border-t border-slate-100 bg-white transition-colors hover:bg-slate-50/70 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-900/60"
                    >
                      <td className="px-3 py-3.5 text-center">
                        <input
                          value={variant.sku}
                          onChange={(e) =>
                            onChange(variantIndex, "sku", e.target.value)
                          }
                          placeholder="KUS-000"
                          className={cn(cellInput, "font-medium")}
                          dir="ltr"
                        />
                      </td>
                      <td className="px-3 py-3.5 text-center">
                        <input
                          value={variant.qr_code}
                          onChange={(e) =>
                            onChange(variantIndex, "qr_code", e.target.value)
                          }
                          placeholder="QR-0000"
                          className={cellInput}
                          dir="ltr"
                        />
                      </td>
                      <td className="px-3 py-3.5 text-center">
                        <input
                          type="number"
                          value={variant.stock}
                          onChange={(e) =>
                            onChange(variantIndex, "stock", e.target.value)
                          }
                          placeholder="0"
                          className={cn(
                            cellInput,
                            "mx-auto w-16 tabular-nums",
                          )}
                        />
                      </td>
                      <td className="px-3 py-3.5 text-center">
                        <div className="mx-auto flex min-w-[120px] items-center justify-center gap-1">
                          <input
                            type="number"
                            value={variant.price}
                            onChange={(e) =>
                              onChange(variantIndex, "price", e.target.value)
                            }
                            placeholder="0"
                            className={cn(cellInput, "w-24 tabular-nums")}
                          />
                          <span className="shrink-0 text-xs text-slate-400">
                            د.ع
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-3.5 text-center">
                        {colorOption ? (
                          <select
                            value={optionValue(variant, colorOption.name) ?? ""}
                            onChange={(e) =>
                              setOption(
                                variantIndex,
                                colorOption,
                                e.target.value,
                                variant,
                              )
                            }
                            className={cn(
                              cellInput,
                              "min-w-[100px] cursor-pointer appearance-none",
                            )}
                          >
                            <option value="">—</option>
                            {colorOption.values
                              .filter((v) => v.value.trim())
                              .map((v) => (
                                <option key={v.value} value={v.value}>
                                  {v.label || v.value}
                                </option>
                              ))}
                          </select>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                      <td className="px-3 py-3.5 text-center">
                        {sizeOption ? (
                          <select
                            value={optionValue(variant, sizeOption.name) ?? ""}
                            onChange={(e) =>
                              setOption(
                                variantIndex,
                                sizeOption,
                                e.target.value,
                                variant,
                              )
                            }
                            className={cn(
                              cellInput,
                              "min-w-[90px] cursor-pointer appearance-none",
                            )}
                          >
                            <option value="">—</option>
                            {sizeOption.values
                              .filter((v) => v.value.trim())
                              .map((v) => (
                                <option key={v.value} value={v.value}>
                                  {v.label || v.value}
                                </option>
                              ))}
                          </select>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                      <td className="px-3 py-3.5">
                        <div className="flex items-center justify-center">
                          <VariantImageCell
                            image={variant.image}
                            onPick={(file) => pickImage(variantIndex, file)}
                          />
                        </div>
                      </td>
                      <td className="px-3 py-3.5">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={onAdd}
                            className={purpleIconBtn}
                            aria-label="إضافة"
                          >
                            <Plus className="size-3.5" strokeWidth={2.5} />
                          </button>
                          <button
                            type="button"
                            className="flex size-9 items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
                            aria-label="تعديل"
                          >
                            <Pencil className="size-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onRemove(variantIndex)}
                            className="flex size-9 items-center justify-center rounded-xl text-rose-500 transition-colors hover:bg-rose-50 dark:hover:bg-rose-500/10"
                            aria-label="حذف"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile cards */}
          <div className="space-y-3 md:hidden" dir="rtl">
            {variants.map((variant, variantIndex) => (
              <div
                key={variantIndex}
                className="space-y-3 rounded-3xl border border-slate-100 bg-white p-3.5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex items-start gap-3">
                  <VariantImageCell
                    image={variant.image}
                    onPick={(file) => pickImage(variantIndex, file)}
                  />
                  <div className="min-w-0 flex-1 space-y-1.5 text-sm">
                    <div className="flex justify-between gap-2">
                      <span className="text-slate-400">KUS</span>
                      <span className="font-medium" dir="ltr">
                        {variant.sku || "—"}
                      </span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-slate-400">السعر</span>
                      <span className="font-semibold">
                        {formatMoney(variant.price) || "—"}
                      </span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-slate-400">الكمية</span>
                      <span className="font-semibold">
                        {variant.stock || "0"}
                      </span>
                    </div>
                    {variant.selectedOptionValues.map((ov) => (
                      <div
                        key={`${ov.optionName}-${ov.value}`}
                        className="flex justify-between gap-2"
                      >
                        <span className="text-slate-400">{ov.optionName}</span>
                        <span className="font-semibold">{ov.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
                  <input
                    value={variant.sku}
                    onChange={(e) =>
                      onChange(variantIndex, "sku", e.target.value)
                    }
                    placeholder="KUS"
                    className="rounded-xl bg-slate-50 px-3 py-2 text-sm dark:bg-slate-950"
                    dir="ltr"
                  />
                  <input
                    value={variant.qr_code}
                    onChange={(e) =>
                      onChange(variantIndex, "qr_code", e.target.value)
                    }
                    placeholder="QR"
                    className="rounded-xl bg-slate-50 px-3 py-2 text-sm dark:bg-slate-950"
                    dir="ltr"
                  />
                  <input
                    type="number"
                    value={variant.price}
                    onChange={(e) =>
                      onChange(variantIndex, "price", e.target.value)
                    }
                    placeholder="السعر"
                    className="rounded-xl bg-slate-50 px-3 py-2 text-sm dark:bg-slate-950"
                  />
                  <input
                    type="number"
                    value={variant.stock}
                    onChange={(e) =>
                      onChange(variantIndex, "stock", e.target.value)
                    }
                    placeholder="الكمية"
                    className="rounded-xl bg-slate-50 px-3 py-2 text-sm dark:bg-slate-950"
                  />
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={onAdd}
                    className={purpleIconBtn}
                    aria-label="إضافة"
                  >
                    <Plus className="size-3.5" strokeWidth={2.5} />
                  </button>
                  <button
                    type="button"
                    className="flex size-9 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100"
                    aria-label="تعديل"
                  >
                    <Pencil className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemove(variantIndex)}
                    className="flex size-9 items-center justify-center rounded-xl text-rose-500 hover:bg-rose-50"
                    aria-label="حذف"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </ProductSectionCard>
  );
}
