import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

export type ErrorPageProps = {
  title?: string;
  description?: string;
  error?: unknown;
  onRetry?: () => void;
  isRetrying?: boolean;
  retryLabel?: string;
  homeTo?: string;
  icon?: ReactNode;
  className?: string;
};

function getErrorMessage(error: unknown): string | undefined {
  if (!error) return undefined;
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;

  // Axios-style errors often have response.data.message
  const anyErr = error as any;
  const msgFromResponse = anyErr?.response?.data?.message;
  if (typeof msgFromResponse === "string") return msgFromResponse;

  return undefined;
}

const ErrorPage = ({
  title = "حدث خطأ",
  description,
  error,
  onRetry,
  isRetrying,
  retryLabel = "إعادة المحاولة",
  homeTo = "/",
  icon,
  className,
}: ErrorPageProps) => {
  const message =
    description ??
    getErrorMessage(error) ??
    "حدث خطأ غير متوقع. حاول مرة أخرى.";

  return (
    <div className={cn("w-full py-12", className)} dir="rtl">
      <Card className="mx-auto max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-destructive/10">
            {icon ?? <AlertTriangle className="size-7 text-destructive" />}
          </div>
          <CardTitle className="text-xl">{title}</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <p className="text-sm text-muted-foreground">{message}</p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
            {onRetry ? (
              <Button onClick={onRetry} disabled={!!isRetrying}>
                {isRetrying ? <Spinner className="size-4" /> : <RotateCcw />}
                <span>{retryLabel}</span>
              </Button>
            ) : null}

            <Button variant="outline" asChild>
              <Link to={homeTo}>
                <Home />
                <span>الصفحة الرئيسية</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ErrorPage;
