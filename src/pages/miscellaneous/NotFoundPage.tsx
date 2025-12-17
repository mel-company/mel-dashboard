import { ArrowRight, FileQuestion } from "lucide-react";

import EmptyPage from "./EmptyPage";

export type NotFoundPageProps = {
  title?: string;
  description?: string;
  backTo?: string;
  backLabel?: string;
};

const NotFoundPage = ({
  title = "الصفحة غير موجودة",
  description = "الرابط الذي تحاول فتحه غير صحيح أو تم حذف الصفحة.",
  backTo = "/",
  backLabel = "العودة للرئيسية",
}: NotFoundPageProps) => {
  return (
    <EmptyPage
      title={title}
      description={description}
      icon={<FileQuestion className="size-7 text-muted-foreground" />}
      primaryAction={{
        label: backLabel,
        to: backTo,
        icon: <ArrowRight className="size-4" />,
      }}
    />
  );
};

export default NotFoundPage;
