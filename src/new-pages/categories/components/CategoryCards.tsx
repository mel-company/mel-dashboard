import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { useToggleCategoryEnabled } from "@/api/wrappers/category.wrappers";
import CategoryPreviewCard from "./CategoryPreviewCard";

type CategoryCardsProps = {
  categories: any[];
  imageBaseUrl?: string;
  onDelete?: (category: any) => void;
  refetch?: () => void;
};

const CategoryCards = ({
  categories,
  imageBaseUrl = "",
  onDelete,
  refetch,
}: CategoryCardsProps) => {
  return (
    <div className="flex flex-col gap-2.5 md:grid md:grid-cols-2 md:gap-4 xl:grid-cols-3">
      {categories.map((category) => (
        <CategoryCard
          key={category.id}
          category={category}
          imageBaseUrl={imageBaseUrl}
          onDelete={onDelete}
          refetch={refetch}
        />
      ))}
    </div>
  );
};

const CategoryCard = ({
  category,
  imageBaseUrl,
  onDelete,
  refetch,
}: {
  category: any;
  imageBaseUrl?: string;
  onDelete?: (category: any) => void;
  refetch?: () => void;
}) => {
  const navigate = useNavigate();
  const [data, setData] = useState(category);
  const { mutate: toggleEnabled } = useToggleCategoryEnabled();

  useEffect(() => {
    setData(category);
  }, [category]);

  const handleToggle = (checked: boolean) => {
    setData({ ...data, enabled: checked });
    toggleEnabled(category.id, {
      onSuccess: () => refetch?.(),
      onError: () => {
        setData(category);
        toast.error("فشل تحديث حالة الفئة");
      },
    });
  };

  return (
    <Link to={`/categories/${category.id}`} className="block">
      <CategoryPreviewCard
        category={data}
        imageBaseUrl={imageBaseUrl}
        footer={
          <div
            className="flex items-center justify-between gap-2"
            dir="ltr"
            onClick={(e) => e.preventDefault()}
          >
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onDelete?.(category);
                }}
                className="flex size-10 items-center justify-center rounded-[14px] text-[#ff5252] transition-colors hover:bg-[#ff5252]/10"
                aria-label="حذف"
              >
                <Trash2 className="size-5" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  navigate(`/categories/${category.id}/edit`);
                }}
                className="flex size-10 items-center justify-center rounded-[14px] text-slate-400 transition-colors hover:bg-white/5 dark:text-[#a4b1fa]"
                aria-label="تعديل"
              >
                <Pencil className="size-5" />
              </button>
              <Switch
                onToggle={handleToggle}
                checked={data.enabled}
                activeLabel="مفعل"
                disabledLabel="معطل"
              />
            </div>
            <span className="text-xs text-slate-400 dark:text-[#a4b1fa]" dir="rtl">
              {data._count?.products ?? 0} منتج
            </span>
          </div>
        }
      />
    </Link>
  );
};

export default CategoryCards;
