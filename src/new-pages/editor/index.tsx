import { useEffect, useState } from "react";
import { ExternalLink, RefreshCw } from "lucide-react";
import { useValidateUserToEditor } from "@/api/wrappers/auth.wrappers";
import { Button } from "@/components/ui/button";

type EditorHandoff = {
  redirectUrl?: string;
  jwt?: string;
  token?: string;
};

const EDITOR_BASE = (
  import.meta.env.VITE_EDITOR_URL || "https://editor.mel.iq"
).replace(/\/$/, "");

function resolveEditorHandoffUrl(data: EditorHandoff): string | null {
  const token = data.jwt || data.token;
  // Prefer the known production auth entry so we never iframe the dashboard
  // into itself when EDITOR_URL is misconfigured.
  if (token) {
    return `${EDITOR_BASE}/auth/token/${encodeURIComponent(token)}`;
  }

  if (!data.redirectUrl) return null;

  try {
    const url = new URL(data.redirectUrl, window.location.origin);
    if (url.origin === window.location.origin) {
      return null;
    }
    return url.toString();
  } catch {
    return null;
  }
}

const EditorPage = () => {
  const { mutate: validateUserToEditor, isPending } = useValidateUserToEditor();
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [iframeBlocked, setIframeBlocked] = useState(false);

  const openEditor = () => {
    setError(null);
    setRedirectUrl(null);
    setIframeBlocked(false);

    validateUserToEditor(undefined, {
      onSuccess: (data: EditorHandoff) => {
        const url = resolveEditorHandoffUrl(data);
        if (!url) {
          setError(
            "رابط المحرر غير صحيح. تأكد أن EDITOR_URL يشير إلى https://editor.mel.iq",
          );
          return;
        }
        setRedirectUrl(url);
      },
      onError: () => {
        setError("تعذر فتح المحرر. حاول مرة أخرى.");
      },
    });
  };

  useEffect(() => {
    openEditor();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- open once on mount
  }, []);

  if (isPending || (!redirectUrl && !error)) {
    return (
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3">
        <div className="size-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">جاري فتح محرر الموقع...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4">
        <p className="text-sm text-muted-foreground">{error}</p>
        <Button onClick={openEditor} className="gap-2">
          <RefreshCw className="size-4" />
          إعادة المحاولة
        </Button>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border bg-background px-3 py-2">
        <p className="text-sm font-medium text-foreground">محرر الموقع</p>
        <Button variant="secondary" size="sm" className="gap-2" asChild>
          <a href={redirectUrl!} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="size-4" />
            فتح في تبويب جديد
          </a>
        </Button>
      </div>

      {iframeBlocked ? (
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
          <p className="max-w-md text-sm text-muted-foreground">
            المتصفح منع عرض المحرر داخل الصفحة. افتحه في تبويب جديد.
          </p>
          <Button asChild className="gap-2">
            <a href={redirectUrl!} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="size-4" />
              فتح المحرر
            </a>
          </Button>
        </div>
      ) : (
        <iframe
          title="محرر الموقع"
          src={redirectUrl!}
          className="min-h-0 w-full flex-1 border-0 bg-white"
          allow="clipboard-read; clipboard-write; fullscreen"
          onError={() => setIframeBlocked(true)}
        />
      )}
    </div>
  );
};

export default EditorPage;
