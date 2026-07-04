import { Link } from "react-router-dom";
import { MapPin, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import TitleBar from "@/components/table/title-bar";

const POSDisabledView = () => {
  return (
    <div className="space-y-6">
      <TitleBar description="نقطة البيع متاحة للمتاجر الفعلية فقط" />

      <div className="flex min-h-[420px] flex-col items-center justify-center rounded-3xl bg-white p-8 text-center">
        <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-sky-50 text-sky-600">
          <Store className="size-8" />
        </div>
        <h2 className="text-xl font-bold text-blue-950">نقطة البيع غير مفعّلة</h2>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          لتفعيل نقطة البيع وموقع المتجر على الخريطة، فعّل خيار{" "}
          <span className="font-semibold text-slate-700">متجر فعلي</span> من إعدادات
          المتجر وأضف عنوان موقعك.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Button asChild className="rounded-full bg-sky-500 hover:bg-sky-600">
            <Link to="/settings/general">
              <MapPin className="size-4" />
              الذهاب إلى الإعدادات
            </Link>
          </Button>
          <Button asChild variant="outline" className="rounded-full">
            <Link to="/">العودة للرئيسية</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default POSDisabledView;
