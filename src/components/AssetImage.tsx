import { useCallback, useEffect, useMemo, useState } from "react";
import {
  buildAssetUrlCandidates,
  coerceImagePath,
} from "@/utils/image-url";
import { cn } from "@/lib/utils";

type AssetImageProps = {
  image?: unknown;
  baseUrl?: string | null;
  alt?: string;
  className?: string;
  fallback?: React.ReactNode;
  /** Eager for above-the-fold hero images. Default: lazy */
  priority?: boolean;
};

/**
 * Lazy asset image with a simple fade-in, and public-CDN / encoding retries.
 */
export function AssetImage({
  image,
  baseUrl,
  alt = "",
  className,
  fallback = null,
  priority = false,
}: AssetImageProps) {
  const candidates = useMemo(
    () => buildAssetUrlCandidates(image, baseUrl),
    [image, baseUrl],
  );
  const [index, setIndex] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const sourceKey = `${coerceImagePath(image)}|${baseUrl ?? ""}`;

  useEffect(() => {
    setIndex(0);
    setLoaded(false);
    setFailed(false);
  }, [sourceKey]);

  // A cached image can finish decoding before React attaches `onLoad`, and
  // that event never fires retroactively — so `loaded` stayed false and the
  // element kept `opacity-0`. The picture was there, complete and the right
  // size, and invisible. Ask the element itself when it attaches, rather than
  // waiting for an event that has already been missed; `key={src}` below gives
  // every candidate a fresh element, so this re-runs per source.
  const readLoadedState = useCallback((el: HTMLImageElement | null) => {
    if (el?.complete && el.naturalWidth > 0) setLoaded(true);
  }, []);

  const src = !failed ? candidates[index] : undefined;
  if (!src) return <>{fallback}</>;

  return (
    <img
      key={src}
      ref={readLoadedState}
      src={src}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      className={cn(
        "transition-opacity duration-300 ease-out",
        loaded ? "opacity-100" : "opacity-0",
        className,
      )}
      onLoad={() => setLoaded(true)}
      onError={() => {
        setLoaded(false);
        setIndex((i) => {
          if (i + 1 < candidates.length) return i + 1;
          setFailed(true);
          return i;
        });
      }}
    />
  );
}

export function hasAssetImage(image?: unknown): boolean {
  return Boolean(coerceImagePath(image));
}

export { buildAssetUrlCandidates } from "@/utils/image-url";
