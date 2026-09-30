import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Isolates a left-to-right run inside RTL text.
 *
 * Identifiers like `#ORD-1001`, `#3eebc29d` or a `24/10/2026 - 11:10 am`
 * timestamp are neutral-then-Latin sequences. The bidi algorithm moves the
 * leading `#` (and a trailing `am`/`pm`) to the visual end of the run, so
 * `#ORD-1001` renders as `ORD-1001#`. Wrapping the run pins its direction
 * without changing the text itself.
 */
const Ltr = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => (
  <span dir="ltr" className={cn("inline-block", className)}>
    {children}
  </span>
);

export default Ltr;
