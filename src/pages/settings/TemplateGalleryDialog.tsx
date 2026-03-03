import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Eye, Layout, Loader2, Plus, Search } from "lucide-react";
import { useSearchTemplatesCursor } from "@/api/wrappers/template.wrappers";
import TemplatePurchaseDialog from "./TemplatePurchaseDialog";

const TEMPLATE_LIMIT = 12;
const GRADIENT_PRESETS = [
  "from-amber-500 to-orange-600",
  "from-slate-600 to-slate-800",
  "from-rose-500 to-pink-600",
  "from-emerald-500 to-teal-600",
  "from-indigo-500 to-violet-600",
  "from-cyan-500 to-blue-600",
];

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebouncedValue(value), delayMs);
    return () => clearTimeout(id);
  }, [value, delayMs]);

  return debouncedValue;
}

// API template shape from backend
interface ApiTemplate {
  id: string;
  name: string | null;
  description: string | null;
  image: string | null;
  is_active?: boolean;
  price?: number;
}

// Display template shape (used by parent for library)
export interface WebsiteTemplate {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  gradient: string;
  isFree: boolean;
  price?: number;
  inLibrary?: boolean;
  isActive?: boolean;
}

function mapApiTemplateToDisplay(
  api: ApiTemplate,
  index: number,
): WebsiteTemplate {
  const gradient =
    GRADIENT_PRESETS[index % GRADIENT_PRESETS.length] ?? GRADIENT_PRESETS[0];
  return {
    id: api.id,
    name: api.name ?? "بدون اسم",
    description: api.description ?? "",
    thumbnail: api.image ?? "",
    gradient,
    isFree: !api.price || api.price === 0,
    price: api.price,
    inLibrary: false,
    isActive: api.is_active ?? false,
  };
}

const formatIqd = (amount: number) => {
  return `${amount.toLocaleString()} د.ع`;
};

interface TemplateGalleryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  library: WebsiteTemplate[];
  onAddToLibrary: (template: WebsiteTemplate) => void;
  onPreview: (templateId: string) => void;
}

const TemplateGalleryDialog = ({
  open,
  onOpenChange,
  library,
  onAddToLibrary,
  onPreview,
}: TemplateGalleryDialogProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);
  const [templateToPurchase, setTemplateToPurchase] =
    useState<WebsiteTemplate | null>(null);
  const debouncedQuery = useDebouncedValue(searchQuery.trim(), 350);

  const handleAddClick = (template: WebsiteTemplate) => {
    setTemplateToPurchase(template);
    setPurchaseDialogOpen(true);
  };

  const handlePurchaseSuccess = (template: WebsiteTemplate) => {
    onAddToLibrary(template);
    setTemplateToPurchase(null);
    setPurchaseDialogOpen(false);
  };

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    error,
  } = useSearchTemplatesCursor(
    {
      query: debouncedQuery || undefined,
      limit: TEMPLATE_LIMIT,
    },
    open,
  );

  const templates: WebsiteTemplate[] =
    data?.pages?.flatMap((page, pageIndex) =>
      (page.data ?? []).map((t: ApiTemplate, i: number) =>
        mapApiTemplateToDisplay(t, pageIndex * TEMPLATE_LIMIT + i),
      ),
    ) ?? [];

  const isInLibrary = (id: string) => library.some((t) => t.id === id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl lg:max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-right">إضافة قوالب للمكتبة</DialogTitle>
          <DialogDescription className="text-right">
            تصفح القوالب المتاحة وأضف ما يناسبك. بعض القوالب مجانية وبعضها
            مدفوع.
          </DialogDescription>
        </DialogHeader>

        {/* Search */}
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="ابحث عن قالب..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10"
            dir="rtl"
          />
        </div>

        {/* Templates Grid */}
        <div className="flex-1 overflow-y-auto custom-scrollbar -mx-1 px-1">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="size-8 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="text-center py-16 text-destructive">
              حدث خطأ أثناء تحميل القوالب
            </div>
          ) : templates.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              لا توجد قوالب
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 py-2">
              {templates.map((template) => {
                const added = isInLibrary(template.id);
                return (
                  <Card
                    key={template.id}
                    className={cn(
                      "overflow-hidden transition-all",
                      "hover:shadow-md border-border",
                    )}
                  >
                    <div
                      className={cn(
                        "h-28 w-full flex items-center justify-center bg-cover bg-center",
                        !template.thumbnail &&
                          `bg-linear-to-br ${template.gradient}`,
                      )}
                      style={
                        template.thumbnail
                          ? { backgroundImage: `url(${template.thumbnail})` }
                          : undefined
                      }
                    >
                      {!template.thumbnail && (
                        <Layout className="size-10 text-white/80" />
                      )}
                    </div>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="font-semibold text-sm">
                          {template.name}
                        </h4>
                        <Badge variant="outline" className="text-xs">
                          {template.price ? (
                            formatIqd(template.price)
                          ) : (
                            <span className="text-muted-foreground">مجاني</span>
                          )}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                        {template.description}
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          className="flex-1"
                          onClick={() => onPreview(template.id)}
                        >
                          <Eye className="size-3.5 ml-1" />
                          معاينة
                        </Button>
                        <Button
                          variant={added ? "secondary" : "default"}
                          size="sm"
                          className="flex-1"
                          onClick={() => handleAddClick(template)}
                          disabled={added}
                        >
                          <Plus className="size-3.5 ml-1" />
                          {added ? "مضاف" : "إضافة"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {hasNextPage && !isLoading && (
            <div className="flex justify-center py-4">
              <Button
                variant="outline"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="gap-2"
              >
                {isFetchingNextPage ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : null}
                تحميل المزيد
              </Button>
            </div>
          )}
        </div>
      </DialogContent>

      <TemplatePurchaseDialog
        open={purchaseDialogOpen}
        onOpenChange={setPurchaseDialogOpen}
        template={templateToPurchase}
        onSuccess={handlePurchaseSuccess}
      />
    </Dialog>
  );
};

export default TemplateGalleryDialog;
