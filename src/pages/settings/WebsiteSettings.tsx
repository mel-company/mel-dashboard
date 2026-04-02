import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Layout,
  Plus,
  Eye,
  Trash2,
  Sparkles,
  CheckCircle,
  Circle,
  ExternalLink,
} from "lucide-react";
import TemplateGalleryDialog from "./TemplateGalleryDialog";
import { cn } from "@/lib/utils";
import { useValidateUserToEditor } from "@/api/wrappers/auth.wrappers";
import { toast } from "sonner";

// Mock data types
interface WebsiteTemplate {
  id: string;
  name: string;
  description: string;
  thumbnail: string; // gradient or placeholder
  gradient: string;
  isFree: boolean;
  priceIqd?: number;
  inLibrary?: boolean;
  isActive?: boolean;
}

// Sample templates in user's library (with one active)
const libraryTemplates: WebsiteTemplate[] = [
  {
    id: "t1",
    name: "المتجر الكلاسيكي",
    description: "تصميم أنيق وعصري مع عرض المنتجات بشكل احترافي",
    thumbnail: "",
    gradient: "from-amber-500 to-orange-600",
    isFree: true,
    inLibrary: true,
    isActive: true,
  },
  {
    id: "t2",
    name: "البساطة الحديثة",
    description: "تصميم بسيط وواضح يركز على تجربة المستخدم",
    thumbnail: "",
    gradient: "from-slate-600 to-slate-800",
    isFree: true,
    inLibrary: true,
    isActive: false,
  },
  {
    id: "t3",
    name: "المتجر الفاخر",
    description: "مظهر فاخر يناسب العلامات التجارية الراقية",
    thumbnail: "",
    gradient: "from-rose-500 to-pink-600",
    isFree: false,
    priceIqd: 25000,
    inLibrary: true,
    isActive: false,
  },
];

type Props = {};

const WebsiteSettings = ({}: Props) => {
  const [addTemplatesOpen, setAddTemplatesOpen] = useState(false);
  const [previewTemplateId, setPreviewTemplateId] = useState<string | null>(
    null,
  );
  const [library, setLibrary] = useState<WebsiteTemplate[]>(libraryTemplates);

  const handleAddToLibrary = (template: WebsiteTemplate) => {
    if (!library.some((t) => t.id === template.id)) {
      setLibrary((prev) => [
        ...prev,
        { ...template, inLibrary: true, isActive: false },
      ]);
    }
  };

  const handleRemoveFromLibrary = (templateId: string) => {
    setLibrary((prev) => prev.filter((t) => t.id !== templateId));
  };

  const handleSetActive = (templateId: string) => {
    setLibrary((prev) =>
      prev.map((t) => ({
        ...t,
        isActive: t.id === templateId,
      })),
    );
  };

  const { mutate: validateUserToEditor } = useValidateUserToEditor();

  const handleValidateUserToEditor = () => {
    validateUserToEditor(undefined, {
      onSuccess: (data) => {
        console.log("data", data);
        toast.success("تم التحقق من المستخدم");
      },
      onError: (error) => {
        console.log("error", error);
        toast.error("حدث خطأ أثناء التحقق من المستخدم");
      },
    });
  };

  return (
    <div className="space-y-6 min-h-screen pb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">إعدادات الموقع</h1>
          <p className="text-muted-foreground mt-1">
            إدارة قوالب موقع المتجر والمكتبة
          </p>
        </div>
        <div>
          {/* <Link to="#"> */}
          <Button onClick={handleValidateUserToEditor} variant={"default"}>
            <ExternalLink size={10} />
            زيارة الموقع
          </Button>
          {/* </Link> */}
        </div>
      </div>

      {/* Template Library Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Layout className="size-5" />
              مكتبة القوالب
            </CardTitle>
            <CardDescription>
              القوالب المضافة لمتجرك. اختر القالب النشط لعرضه على الموقع.
            </CardDescription>
          </div>
          <Button
            onClick={() => setAddTemplatesOpen(true)}
            className="gap-2 shrink-0"
          >
            <Plus className="size-4" />
            إضافة قوالب
          </Button>
        </CardHeader>
        <CardContent>
          {library.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {library.map((template) => (
                <Card
                  key={template.id}
                  className={cn(
                    "overflow-hidden transition-all duration-200",
                    template.isActive &&
                      "ring-2 ring-primary ring-offset-2 ring-offset-background",
                  )}
                >
                  {/* Template Preview Thumbnail */}
                  <div
                    className={cn(
                      "h-36 w-full bg-linear-to-br",
                      template.gradient,
                      "flex items-center justify-center",
                    )}
                  >
                    <Layout className="size-12 text-white/80" />
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-semibold text-foreground">
                        {template.name}
                      </h3>
                      {template.isActive && (
                        <Badge
                          variant="default"
                          className="shrink-0 gap-1 text-xs"
                        >
                          <Sparkles className="size-3" />
                          قيد الاستخدام
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {template.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="flex-1 min-w-0"
                        onClick={() => setPreviewTemplateId(template.id)}
                      >
                        <Eye className="size-4 ml-1" />
                        معاينة
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="flex-1 min-w-0"
                        onClick={() => handleSetActive(template.id)}
                        disabled={template.isActive}
                      >
                        {template.isActive ? (
                          <CheckCircle className="size-4 ml-1" />
                        ) : (
                          <Circle className="size-4 ml-1" />
                        )}
                        {template.isActive ? "نشط" : "تحديد"}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleRemoveFromLibrary(template.id)}
                        disabled={template.isActive}
                        title="إزالة من المكتبة"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border border-dashed border-border rounded-lg">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                <Layout className="size-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                لا توجد قوالب في المكتبة
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                أضف قوالب من المكتبة لبدء تخصيص موقع متجرك
              </p>
              <Button
                onClick={() => setAddTemplatesOpen(true)}
                className="gap-2"
              >
                <Plus className="size-4" />
                إضافة قوالب
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <TemplateGalleryDialog
        open={addTemplatesOpen}
        onOpenChange={setAddTemplatesOpen}
        library={library}
        onAddToLibrary={handleAddToLibrary}
        onPreview={setPreviewTemplateId}
      />

      {/* Preview Dialog (placeholder - design only) */}
      <Dialog
        open={!!previewTemplateId}
        onOpenChange={() => setPreviewTemplateId(null)}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-right">معاينة القالب</DialogTitle>
            <DialogDescription className="text-right">
              معاينة سريعة لمظهر القالب على موقعك
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto">
            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center border border-border">
              <div className="text-center text-muted-foreground">
                <Eye className="size-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">معاينة القالب</p>
                <p className="text-xs mt-1">سيتم ربط المعاينة الفعلية لاحقاً</p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WebsiteSettings;
