import { useCallback, useEffect, useRef, useState } from "react";
import { ExternalLink, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useValidateUserToEditor } from "@/api/wrappers/auth.wrappers";
import { useResolvedTheme } from "@/hooks/use-resolved-theme";
import { getTenantSubdomain } from "@/utils/tenant-subdomain";
import { Button } from "@/components/ui/button";

type EditorHandoff = {
  redirectUrl?: string;
  jwt?: string;
  token?: string;
  /** The store's platform slug, which the handoff URL has to carry. */
  subdomain?: string;
};

const EDITOR_BASE = (
  import.meta.env.VITE_EDITOR_URL || "https://editor.mel.iq"
).replace(/\/$/, "");

/**
 * The exact origin the editor is allowed to be posted to.
 *
 * Never `"*"`: the iframe can navigate itself, and a wildcard target would
 * keep delivering to wherever it ended up. A misconfigured EDITOR_URL that
 * will not parse means no channel rather than a broken page.
 */
const EDITOR_ORIGIN = (() => {
  try {
    return new URL(EDITOR_BASE).origin;
  } catch {
    return null;
  }
})();

/**
 * The message the editor listens for. Its own copy of the string, since the
 * two apps are separate deployments with no shared package — the editor pins
 * it as `THEME_MESSAGE` in `editor-theme.ts`.
 */
const THEME_MESSAGE = "mel:editor-theme";

/**
 * Which store this session belongs to.
 *
 * The handoff URL has to say so. The editor's fallback for a link that does
 * not is to read the tenant off its own hostname, and `editor.mel.iq` parses
 * as the store "editor" — so the merchant is signed in correctly and then
 * every request the editor makes is scoped to a store that does not exist,
 * which reads as an editor that loaded empty rather than as an error.
 *
 * The server answers with it; `redirectUrl` is read second so a server that
 * has not shipped that field yet still works, and the hostname
 * (`dash.<slug>.mel.iq`) is the last resort.
 */
function resolveStoreSlug(data: EditorHandoff): string {
  if (data.subdomain) return data.subdomain;

  if (data.redirectUrl) {
    try {
      const fromRedirect = new URL(
        data.redirectUrl,
        window.location.origin,
      ).searchParams.get("store");
      if (fromRedirect) return fromRedirect;
    } catch {
      // A redirectUrl we cannot parse tells us nothing; fall through.
    }
  }

  return getTenantSubdomain();
}

/**
 * The editor runs on its own origin, so it can read neither this app's
 * `localStorage` nor the class on this document — an iframe is a separate
 * document with a separate storage partition. The query string is the only
 * channel the handoff has, and `?theme=` is what the editor reads it from,
 * before it paints. Without it, opening the editor from a light dashboard
 * puts a dark panel inside a light page.
 *
 * `system` is resolved to a concrete value here rather than passed through:
 * the editor has no `system` setting, and resolving it on this side is what
 * makes the two agree when the OS is light and the editor's own default is
 * dark.
 */
function resolveEditorHandoffUrl(
  data: EditorHandoff,
  theme: "light" | "dark",
  generationId?: string | null,
): string | null {
  const token = data.jwt || data.token;
  if (!token) return null;

  // `/editor/bridge` is the editor's one sign-in entry point, and the same
  // one the AI generator hands out — so both handoffs go through a single
  // route rather than two shapes that drift. The older
  // `/auth/token/:token` form this used to build is still routed there, but
  // it has nowhere to put the store, and it lands the merchant on the
  // editor's own dashboard rather than the editor.
  //
  // No `generation=` by default: that tells the bridge to overwrite the
  // merchant's pages with a generation result. Right once, immediately after
  // generating — wrong on a button they press every day. The one time it is
  // passed is the landing page's hand-off straight after a generation (see
  // `takeGenerationId`).
  //
  // The origin comes from this app's own config rather than the server's
  // `redirectUrl`, so a misconfigured EDITOR_URL can never iframe the
  // dashboard into itself.
  const url = new URL(`${EDITOR_BASE}/editor/bridge`);
  url.searchParams.set("token", token);
  url.searchParams.set("next", "/editor");

  const store = resolveStoreSlug(data);
  if (store) url.searchParams.set("store", store);

  if (generationId) url.searchParams.set("generation", generationId);

  url.searchParams.set("theme", theme);
  return url.toString();
}

/**
 * The generation the landing page just finished, if this visit is its
 * hand-off (`/editor?generation=<id>`, via `/bridge?next=`).
 *
 * Read once and removed from the address bar, so a reload or a bookmark of
 * this page never re-applies a generation over edits made since.
 */
function takeGenerationId(): string | null {
  const url = new URL(window.location.href);
  const id = url.searchParams.get("generation");
  if (!id) return null;
  url.searchParams.delete("generation");
  window.history.replaceState(window.history.state, "", url.toString());
  return id;
}

const EditorPage = () => {
  const { mutate: validateUserToEditor, isPending } = useValidateUserToEditor();
  // A second instance on purpose — see `openInNewTab`.
  const { mutate: mintTabSession, isPending: isMintingTab } =
    useValidateUserToEditor();
  const theme = useResolvedTheme();
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [iframeBlocked, setIframeBlocked] = useState(false);
  const frameRef = useRef<HTMLIFrameElement | null>(null);
  // Only the embedded editor's first hand-off loads it; the "new tab" button
  // never does.
  const generationIdRef = useRef<string | null | undefined>(undefined);
  if (generationIdRef.current === undefined) {
    generationIdRef.current = takeGenerationId();
  }

  /**
   * Keep the embedded editor on our theme after it has opened.
   *
   * `?theme=` settles the first paint and nothing after it — the URL is
   * baked into `redirectUrl` once, and rebuilding it to push a change would
   * reload the iframe, re-running the token exchange and throwing away
   * whatever the merchant was in the middle of. A colour should not cost a
   * page load.
   *
   * Sent on every theme change and again on each `load`, because the frame
   * navigates internally (bridge → `/editor`) and a message posted while it
   * was still loading reaches a document that is on its way out. `setTheme`
   * on the other side ignores a value it already holds, so the repeats are
   * free.
   */
  const postTheme = useCallback(() => {
    if (!EDITOR_ORIGIN) return;
    frameRef.current?.contentWindow?.postMessage(
      { type: THEME_MESSAGE, theme },
      EDITOR_ORIGIN,
    );
  }, [theme]);

  useEffect(() => {
    postTheme();
  }, [postTheme, redirectUrl]);

  /**
   * Open the editor in a tab of its own.
   *
   * This cannot reuse `redirectUrl`. A handoff token is **single use**: the
   * bridge exchanges it through `/auth/refresh-dual`, which mints a
   * replacement and writes it over `storeUserSession.jwt`, and the session is
   * looked up by that exact column. The iframe beside this button has already
   * spent the one in `redirectUrl`, so following the same link a second time
   * lands on the editor's "تعذر تسجيل الدخول" screen. From the merchant's
   * side the button simply does not work.
   *
   * So it mints a fresh one per click, on its own mutation instance — sharing
   * the one `openEditor` uses would flip `isPending`, swap the page for the
   * spinner and tear down the iframe the merchant is still working in.
   *
   * The tab is opened empty *inside the click* and navigated when the token
   * arrives. Opening it after the await instead loses the user activation and
   * the browser blocks it as a popup.
   */
  const openInNewTab = () => {
    const tab = window.open("about:blank", "_blank");
    if (!tab) {
      toast.error("المتصفح منع فتح تبويب جديد.");
      return;
    }
    // `noopener` on window.open would return null and leave nothing to
    // navigate, so the reference is severed by hand instead.
    tab.opener = null;

    mintTabSession(undefined, {
      onSuccess: (data: EditorHandoff) => {
        const url = resolveEditorHandoffUrl(data, theme);
        if (!url) {
          tab.close();
          toast.error("تعذر إنشاء جلسة للمحرر.");
          return;
        }
        // `replace`, so Back in the new tab does not return to about:blank.
        tab.location.replace(url);
      },
      onError: () => {
        tab.close();
        toast.error("تعذر فتح المحرر في تبويب جديد.");
      },
    });
  };

  const openEditor = () => {
    setError(null);
    setRedirectUrl(null);
    setIframeBlocked(false);

    validateUserToEditor(undefined, {
      onSuccess: (data: EditorHandoff) => {
        const url = resolveEditorHandoffUrl(
          data,
          theme,
          generationIdRef.current,
        );
        if (!url) {
          // The only way to get here now: the response carried no token.
          // The editor cannot sign anyone in on its own, so there is nothing
          // to open.
          setError("تعذر إنشاء جلسة للمحرر. حاول مرة أخرى.");
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
        <Button
          variant="secondary"
          size="sm"
          className="gap-2"
          onClick={openInNewTab}
          disabled={isMintingTab}
        >
          <ExternalLink className="size-4" />
          فتح في تبويب جديد
        </Button>
      </div>

      {iframeBlocked ? (
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
          <p className="max-w-md text-sm text-muted-foreground">
            المتصفح منع عرض المحرر داخل الصفحة. افتحه في تبويب جديد.
          </p>
          <Button
            className="gap-2"
            onClick={openInNewTab}
            disabled={isMintingTab}
          >
            <ExternalLink className="size-4" />
            فتح المحرر
          </Button>
        </div>
      ) : (
        <iframe
          ref={frameRef}
          title="محرر الموقع"
          src={redirectUrl!}
          className="min-h-0 w-full flex-1 border-0 bg-background"
          allow="clipboard-read; clipboard-write; fullscreen"
          onLoad={postTheme}
          onError={() => setIframeBlocked(true)}
        />
      )}
    </div>
  );
};

export default EditorPage;
