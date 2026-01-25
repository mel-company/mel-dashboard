import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { Keyboard } from "lucide-react";

type ShortcutItem = {
  description: string;
  keys: React.ReactNode;
};

const shortcuts: ShortcutItem[] = [
  {
    description: "انتقل الى الصفحة الرئيسية",
    keys: (
      <KbdGroup>
        <Kbd>Ctrl</Kbd>
        <Kbd>H</Kbd>
      </KbdGroup>
    ),
  },
  {
    description: "عرض قائمة التنقل",
    keys: (
      <KbdGroup>
        <Kbd>Ctrl</Kbd>
        <Kbd>K</Kbd>
      </KbdGroup>
    ),
  },
  {
    description: "افتح الإعدادات",
    keys: (
      <KbdGroup>
        <Kbd>Ctrl</Kbd>
        <Kbd>,</Kbd>
      </KbdGroup>
    ),
  },
  {
    description: "افتح قائمة الاختصارات",
    keys: (
      <KbdGroup>
        <Kbd>Ctrl</Kbd>
        <Kbd>/</Kbd>
      </KbdGroup>
    ),
  },
];

type Props = {};

const Shortcuts = ({}: Props) => {
  return (
    <div className="space-y-6 p-6 lg:p-0">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          اختصارات لوحة المفاتيح
        </h1>
        <p className="text-muted-foreground mt-1">
          اختصارات لتنقل واستخدام لوحة التحكم بشكل أسرع.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Keyboard className="size-5 text-muted-foreground" />
            <CardTitle>عام</CardTitle>
          </div>
          <CardDescription>
            اختصارات عامة متاحة في جميع أجزاء التطبيق.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-border">
            {shortcuts.map(({ description, keys }, i) => (
              <div
                key={i}
                className="flex flex-col gap-1.5 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
              >
                <span className="text-sm text-foreground">{description}</span>
                <div className="shrink-0">{keys}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Shortcuts;
