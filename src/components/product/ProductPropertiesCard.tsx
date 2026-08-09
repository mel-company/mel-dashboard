import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DashedTag,
  ProductSectionCard,
  PurpleAddButton,
} from "@/components/product/tags";

export type PropertyItem = {
  name: string;
  value: string;
};

const fieldClass =
  "w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-right text-sm outline-none placeholder:text-slate-400 focus:border-sky-300 focus:ring-2 focus:ring-sky-100 dark:border-slate-700 dark:bg-slate-900";

type ProductPropertiesCardProps = {
  properties: PropertyItem[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  onChange: (index: number, field: "name" | "value", value: string) => void;
  readOnly?: boolean;
};

export function ProductPropertiesCard({
  properties,
  onAdd,
  onRemove,
  onChange,
  readOnly = false,
}: ProductPropertiesCardProps) {
  const filled = properties.filter((p) => p.name.trim() && p.value.trim());
  const drafting = properties.some((p) => !p.name.trim() || !p.value.trim());

  return (
    <ProductSectionCard
      title="خصائص المنتج"
      description="مواصفات المنتج: كالماركة، الخامة، والجنس"
      action={
        !readOnly ? (
          <PurpleAddButton onClick={onAdd} label="اضافة خاصية جديدة" />
        ) : undefined
      }
    >
      {!readOnly && drafting ? (
        <div className="mb-3 space-y-2">
          {properties.map((property, index) => {
            if (property.name.trim() && property.value.trim()) return null;
            return (
              <div key={index} className="flex items-center gap-2" dir="rtl">
                <input
                  value={property.name}
                  onChange={(e) => onChange(index, "name", e.target.value)}
                  placeholder="اسم الخاصية"
                  className={cn(fieldClass, "flex-1")}
                />
                <input
                  value={property.value}
                  onChange={(e) => onChange(index, "value", e.target.value)}
                  placeholder="القيمة"
                  className={cn(fieldClass, "flex-1")}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-8 shrink-0 text-destructive"
                  onClick={() => onRemove(index)}
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            );
          })}
        </div>
      ) : null}

      {filled.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2" dir="rtl">
          {properties.map((p, i) => {
            if (!p.name.trim() || !p.value.trim()) return null;
            return (
              <DashedTag
                key={`${p.name}-${i}`}
                lead={p.name}
                onRemove={readOnly ? undefined : () => onRemove(i)}
              >
                {p.value}
              </DashedTag>
            );
          })}
        </div>
      ) : !drafting ? (
        <p className="py-6 text-center text-sm text-muted-foreground">
          لا توجد خصائص — اضغط + للإضافة
        </p>
      ) : null}
    </ProductSectionCard>
  );
}
