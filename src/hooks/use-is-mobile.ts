import { useEffect, useState } from "react";

/**
 * Matches the `md` breakpoint the overlays switch on: below it a drawer docks
 * to the bottom of the screen, above it to the side.
 */
export function useIsMobile(query = "(max-width: 767px)") {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(query);
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [query]);

  return isMobile;
}
