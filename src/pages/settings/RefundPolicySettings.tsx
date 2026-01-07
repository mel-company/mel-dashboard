import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Shield, Pencil, Save, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import DemoUsageTextEditor from "./DemoUsageTextEditor";
import SlateContentRenderer from "@/components/text-editor/SlateContentRenderer";
import { useState, useEffect } from "react";
import type { Descendant } from "slate";
import {
  useFetchRefundPolicy,
  useCreateRefundPolicy,
  useUpdateRefundPolicy,
} from "@/api/wrappers/policies.wrappers";

type Props = {};

const RefundPolicySettings = ({}: Props) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editorValue, setEditorValue] = useState<Descendant[]>([
    {
      type: "paragraph",
      children: [{ text: "" }],
    } as Descendant,
  ]);

  const {
    data: refundPolicy,
    isLoading,
    isError,
    error,
  } = useFetchRefundPolicy();

  const createMutation = useCreateRefundPolicy();
  const updateMutation = useUpdateRefundPolicy();

  // Initialize editor with API data when it loads
  useEffect(() => {
    if (refundPolicy?.content) {
      try {
        // If content is a string, parse it; otherwise use it directly
        const content =
          typeof refundPolicy.content === "string"
            ? JSON.parse(refundPolicy.content)
            : refundPolicy.content;

        if (Array.isArray(content) && content.length > 0) {
          setEditorValue(content);
        }
      } catch (e) {
        console.error("Error parsing content:", e);
      }
    }
  }, [refundPolicy]);

  const handleSubmit = async () => {
    try {
      if (refundPolicy?.id) {
        // Update existing
        await updateMutation.mutateAsync(editorValue);
        toast.success("تم تحديث سياسة الإسترداد بنجاح");
      } else {
        // Create new
        await createMutation.mutateAsync(editorValue);
        toast.success("تم إنشاء سياسة الإسترداد بنجاح");
      }
      setIsEditing(false);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "حدث خطأ أثناء حفظ سياسة الإسترداد"
      );
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    // Reset to original content
    if (refundPolicy?.content) {
      try {
        const content =
          typeof refundPolicy.content === "string"
            ? JSON.parse(refundPolicy.content)
            : refundPolicy.content;

        if (Array.isArray(content) && content.length > 0) {
          setEditorValue(content);
        }
      } catch (e) {
        console.error("Error parsing content:", e);
      }
    }
    setIsEditing(false);
  };

  const isLoadingData =
    isLoading || createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6 min-h-full pb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            سياسة الإسترداد
          </h1>
          <p className="text-muted-foreground mt-1">
            إدارة سياسة الإسترداد والاسترجاع
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleCancel}
                disabled={isLoadingData}
              >
                <X className="size-4" />
                إلغاء
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={handleSubmit}
                disabled={isLoadingData}
              >
                {isLoadingData ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Save className="size-4" />
                )}
                حفظ
              </Button>
            </>
          ) : (
            <Button
              variant="default"
              size="sm"
              onClick={handleEdit}
              disabled={isLoadingData}
            >
              <Pencil className="size-4" />
              تعديل
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="size-5" />
              سياسة الإسترداد
            </CardTitle>
            <CardDescription>
              شروط إرجاع المنتجات واسترداد المبالغ
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-y-4">
              <Label htmlFor="refundPolicy">نص سياسة الإسترداد</Label>
              {isLoadingData && !refundPolicy ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="size-6 animate-spin text-muted-foreground" />
                </div>
              ) : isError ? (
                <div className="text-destructive text-sm py-4">
                  {error?.message || "حدث خطأ أثناء تحميل البيانات"}
                </div>
              ) : isEditing ? (
                <DemoUsageTextEditor
                  value={editorValue}
                  onChange={setEditorValue}
                />
              ) : refundPolicy?.content ? (
                <div className="border rounded-lg p-6 bg-muted/30 min-h-[200px]">
                  <SlateContentRenderer
                    content={(() => {
                      try {
                        return typeof refundPolicy.content === "string"
                          ? JSON.parse(refundPolicy.content)
                          : refundPolicy.content;
                      } catch (e) {
                        console.error("Error parsing content for display:", e);
                        return [
                          {
                            type: "paragraph",
                            children: [{ text: "خطأ في تحميل المحتوى" }],
                          },
                        ];
                      }
                    })()}
                  />
                </div>
              ) : (
                <div className="border rounded-lg p-6 bg-muted/30 min-h-[200px] flex items-center justify-center text-muted-foreground">
                  لا يوجد محتوى. اضغط على تعديل لإضافة سياسة الإسترداد.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RefundPolicySettings;
