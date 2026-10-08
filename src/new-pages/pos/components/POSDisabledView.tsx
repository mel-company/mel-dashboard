import { Link } from "react-router-dom";
import { MapPin, Rocket, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import TitleBar from "@/components/table/title-bar";

/**
 * Why POS is closed. Two different answers that used to be one.
 *
 * `setting` is the store's own «متجر فعلي» switch, which the merchant can flip
 * themselves. `plan` is the platform's refusal — POS is PLUS-only and the gate
 * also withdraws it when the term lapses — and telling that merchant to go and
 * change a setting sends them somewhere that cannot help them.
 */
type PosDisabledReason = "setting" | "plan";

const POSDisabledView = ({
  reason = "setting",
}: {
  reason?: PosDisabledReason;
}) => {
  const isPlan = reason === "plan";

  return (
    <div className="space-y-6">
      <TitleBar
        description={
          isPlan
            ? "نقطة البيع متاحة في باقة MEL PLUS"
            : "نقطة البيع متاحة للمتاجر الفعلية فقط"
        }
      />

      <div className="flex min-h-[420px] flex-col items-center justify-center rounded-3xl border border-transparent bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-950">
        <div
          className={
            isPlan
              ? "mb-4 flex size-16 items-center justify-center rounded-full bg-violet-50 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300"
              : "mb-4 flex size-16 items-center justify-center rounded-full bg-sky-50 text-sky-600 dark:bg-sky-500/15 dark:text-sky-300"
          }
        >
          {isPlan ? <Rocket className="size-8" /> : <Store className="size-8" />}
        </div>

        <h2 className="text-xl font-bold text-blue-950 dark:text-slate-100">
          {isPlan ? "نقطة البيع غير مشمولة في باقتك" : "نقطة البيع غير مفعّلة"}
        </h2>

        {isPlan ? (
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            نقطة البيع (POS) متاحة في باقة{" "}
            <span className="font-semibold text-slate-700 dark:text-slate-200">
              MEL PLUS
            </span>
            . إن كان اشتراكك منتهياً، جدّده لاستعادة مزايا باقتك.
          </p>
        ) : (
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            لتفعيل نقطة البيع وموقع المتجر على الخريطة، فعّل خيار{" "}
            <span className="font-semibold text-slate-700 dark:text-slate-200">
              متجر فعلي
            </span>{" "}
            من إعدادات المتجر وأضف عنوان موقعك.
          </p>
        )}

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {isPlan ? (
            <Button
              asChild
              className="rounded-full bg-violet-600 hover:bg-violet-700"
            >
              <Link to="/settings/general">
                <Rocket className="size-4" />
                إدارة الاشتراك
              </Link>
            </Button>
          ) : (
            <Button asChild className="rounded-full bg-sky-500 hover:bg-sky-600">
              <Link to="/settings/general">
                <MapPin className="size-4" />
                الذهاب إلى الإعدادات
              </Link>
            </Button>
          )}
          <Button asChild variant="outline" className="rounded-full">
            <Link to="/">العودة للرئيسية</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default POSDisabledView;
