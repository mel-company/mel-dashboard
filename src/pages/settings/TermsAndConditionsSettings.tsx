import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FileText, Shield, Upload, Save } from "lucide-react";
import { toast } from "sonner";
import DemoUsageTextEditor from "./DemoUsageTextEditor";

type Props = {};

const TermsAndConditionsSettings = ({}: Props) => {
  const [legalDocs, setLegalDocs] = useState({
    termsAndConditions: "",
    privacyPolicy: "",
    returnRefundPolicy: "",
    cookieConsent: false,
    ageRestriction: false,
    minAge: 18,
  });

  const [uploadedFiles, setUploadedFiles] = useState<
    Record<string, File | null>
  >({
    termsFile: null,
    privacyFile: null,
    returnFile: null,
  });

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setLegalDocs((prev) => ({ ...prev, [name]: value }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLegalDocs((prev) => ({
      ...prev,
      [name]: name === "minAge" ? parseInt(value) || 0 : value,
    }));
  };

  const handleToggle = (key: keyof typeof legalDocs) => {
    setLegalDocs((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "termsFile" | "privacyFile" | "returnFile"
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFiles((prev) => ({ ...prev, [type]: file }));
      toast.success("تم رفع الملف بنجاح");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Submit to API
    toast.success("تم حفظ المستندات القانونية بنجاح");
  };

  return (
    <div className="space-y-6 min-h-full pb-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">الشروط والأحكام</h1>
        <p className="text-muted-foreground mt-1">
          إدارة المستندات القانونية وسياسات المتجر
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Terms and Conditions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="size-5" />
              الشروط والأحكام
            </CardTitle>
            <CardDescription>
              الشروط والأحكام التي يوافق عليها العملاء عند الشراء
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-y-4">
              <Label htmlFor="termsAndConditions">نص الشروط والأحكام</Label>
              <DemoUsageTextEditor />
            </div>
          </CardContent>
        </Card>

        {/* Privacy Policy */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="size-5" />
              سياسة الخصوصية
            </CardTitle>
            <CardDescription>كيفية جمع واستخدام بيانات العملاء</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-y-4">
              <Label htmlFor="privacyPolicy">نص سياسة الخصوصية</Label>
              <DemoUsageTextEditor />
            </div>
          </CardContent>
        </Card>

        {/* Return & Refund Policy */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="size-5" />
              سياسة الإسترداد
            </CardTitle>
            <CardDescription>
              شروط إرجاع المنتجات واسترداد المبالغ
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-y-4">
              <Label htmlFor="returnRefundPolicy">
                نص سياسة الإرجاع والاسترداد
              </Label>
              <DemoUsageTextEditor />
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline">
            إلغاء
          </Button>
          <Button type="submit" className="gap-2">
            <Save className="size-4" />
            حفظ المستندات
          </Button>
        </div>
      </form>
    </div>
  );
};

export default TermsAndConditionsSettings;
