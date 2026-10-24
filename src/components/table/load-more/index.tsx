import { useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  fetchNextPage?: () => void;
  disabled?: boolean;
};

/**
 * «تحميل المزيد» under a card list, plus a sentinel that loads the next cursor
 * page when it scrolls into view.
 *
 * Each instance watches its own element. The pages used to share the one
 * `loadMoreRef` between the phone list and the desktop view, so whichever
 * rendered last won: on phones that was the desktop copy, hidden by
 * `xl:hidden`, which never intersects, so scrolling never loaded more.
 *
 * Tables don't use this: their page footer pulls the next page itself (see
 * `useTablePagination`).
 */
const LoadMore = ({
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  disabled,
}: Props) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hasNextPage || isFetchingNextPage || !fetchNextPage) return;
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) fetchNextPage();
      },
      { rootMargin: "200px", threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (!hasNextPage) return null;

  return (
    <div ref={ref} className="flex justify-center py-4">
      <Button
        variant="outline"
        className="gap-2"
        onClick={() => fetchNextPage?.()}
        disabled={isFetchingNextPage || disabled}
      >
        {isFetchingNextPage ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            جاري التحميل...
          </>
        ) : (
          "تحميل المزيد"
        )}
      </Button>
    </div>
  );
};

export default LoadMore;
