import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Globe, Save } from "lucide-react";
import { useFindDomainDetails } from "@/api/wrappers/domain.wrappers";

type Props = {};

const DomainSettings = ({}: Props) => {
  // @ts-ignore
  const { data: domainDetails, isLoading } = useFindDomainDetails();

  const [domainSettings, setDomainSettings] = useState({
    customDomain: "",
    subdomain: "",
    wwwRedirect: "www",
    sslEnabled: true,
    sslStatus: "active", // active, pending, expired
    urlSlugRules: "lowercase",
    maintenanceMode: false,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDomainSettings((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(domainSettings);
  };

  return (
    <div className="space-y-6 min-h-full pb-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">إعدادات النطاق</h1>
        <p className="text-muted-foreground mt-1">
          قم بتكوين النطاق وعناوين URL للمتجر
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Subdomain */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="size-5" />
              النطاق الفرعي
            </CardTitle>
            <CardDescription>
              قم بتعيين النطاق الفرعي لمتجرك (مثل: mystore.mel.iq)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-y-2">
              <Label htmlFor="subdomain">النطاق الفرعي</Label>
              <div className="flex items-center border border-input rounded-md bg-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                <span className="px-3 py-2 text-muted-foreground bg-muted border-r border-input text-sm shrink-0">
                  mel.iq
                </span>
                <Input
                  id="subdomain"
                  name="subdomain"
                  value={domainSettings.subdomain}
                  onChange={handleInputChange}
                  placeholder={domainDetails?.domain || "mystore"}
                  className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-r-none"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                النطاق الكامل سيكون: {domainSettings.subdomain || "mystore"}
                .mel.iq
              </p>
            </div>

            {/* {domainSettings.customDomain && (
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-2">تعليمات الإعداد:</p>
                <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                  <li>أضف سجل A في DNS الخاص بك يشير إلى: 192.0.2.1</li>
                  <li>أو أضف سجل CNAME يشير إلى: yourstore.platform.com</li>
                  <li>انتظر حتى يتم التحقق من النطاق (قد يستغرق 24-48 ساعة)</li>
                </ol>
              </div>
            )} */}
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline">
            إلغاء
          </Button>
          <Button type="submit" className="gap-2">
            <Save className="size-4" />
            حفظ الإعدادات
          </Button>
        </div>
      </form>
    </div>
  );
};

export default DomainSettings;
