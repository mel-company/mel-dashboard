import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  AddedLabel,
  DashedTag,
  ProductSectionCard,
} from "@/components/product/tags";

export type PropertyItem = {
  name: string;
  value: string;
};

const fieldClass =
  "w-full rounded-2xl border-0 bg-slate-50 px-3 py-2.5 text-right text-sm outline-none ring-sky-300 placeholder:text-muted-foreground focus:ring-2 dark:bg-slate-900";

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

  return (
    <ProductSectionCard
      title="خصائص المنتج"
      description="مواصفات المنتج: كالماركة، الخامة، والجنس"
      action={
        !readOnly ? (
          <Button
            type="button"
            size="sm"
            className="gap-1 rounded-full"
            onClick={onAdd}
          >
            <Plus className="size-3" />
            اضافة خاصية جديدة
          </Button>
        ) : undefined
      }
    >
      {!readOnly && (
        <div className="mb-3 space-y-2">
          {properties.map((property, index) => (
            <div key={index} className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-8 text-destructive"
                onClick={() => onRemove(index)}
              >
                <Trash2 className="size-3.5" />
              </Button>
              <input
                value={property.value}
                onChange={(e) => onChange(index, "value", e.target.value)}
                placeholder="القيمة"
                className={cn(fieldClass, "flex-1")}
              />
              <input
                value={property.name}
                onChange={(e) => onChange(index, "name", e.target.value)}
                placeholder="اسم الخاصية"
                className={cn(fieldClass, "flex-1")}
              />
            </div>
          ))}
        </div>
      )}

      {filled.length > 0 ? (
        <div className="flex flex-wrap items-center justify-end gap-2">
          <AddedLabel />
          {properties.map((p, i) => {
            if (!p.name.trim() || !p.value.trim()) return null;
            return (
              <DashedTag
                key={`${p.name}-${i}`}
                onRemove={readOnly ? undefined : () => onRemove(i)}
              >
                {p.name} : {p.value}
              </DashedTag>
            );
          })}
        </div>
      ) : (
        <p className="py-6 text-center text-sm text-muted-foreground">
          لا توجد خصائص مضافة
        </p>
      )}
    </ProductSectionCard>
  );
}
