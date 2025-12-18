import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Inbox } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type PageAction = {
  label: string;
  to?: string;
  onClick?: () => void;
  icon?: ReactNode;
  variant?:
    | "default"
    | "outline"
    | "secondary"
    | "ghost"
    | "destructive"
    | "link";
};

export type EmptyPageProps = {
  title: string;
  description?: string;
  icon?: ReactNode;
  primaryAction?: PageAction;
  secondaryAction?: PageAction;
  className?: string;
};

function ActionButton({ action }: { action: PageAction }) {
  const content = (
    <>
      {action.icon}
      <span>{action.label}</span>
    </>
  );

  if (action.to) {
    return (
      <Button variant={action.variant ?? "default"} asChild>
        <Link to={action.to}>{content}</Link>
      </Button>
    );
  }

  return (
    <Button
      variant={action.variant ?? "default"}
      onClick={action.onClick}
      disabled={!action.onClick}
    >
      {content}
    </Button>
  );
}

const EmptyPage = ({
  title,
  description,
  icon,
  primaryAction,
  secondaryAction,
  className,
}: EmptyPageProps) => {
  return (
    <div className={cn("w-full py-12", className)} dir="rtl">
      <Card className="mx-auto max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-muted">
            {icon ?? <Inbox className="size-7 text-muted-foreground" />}
          </div>
          <CardTitle className="text-xl">{title}</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          {description ? (
            <p className="text-sm text-muted-foreground">{description}</p>
          ) : null}

          {primaryAction || secondaryAction ? (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
              {primaryAction ? <ActionButton action={primaryAction} /> : null}
              {secondaryAction ? (
                <ActionButton action={secondaryAction} />
              ) : null}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
};

export default EmptyPage;
