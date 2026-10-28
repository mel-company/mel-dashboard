import { HugeiconsIcon } from "@hugeicons/react";
import {
  Link01Icon,
  Loading03Icon,
  Delete02Icon,
} from "@hugeicons-pro/core-stroke-rounded";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { StoreDomainLink } from "@/api/endpoints/domain.endpoints";

type StoreDomainLinksProps = {
  links: StoreDomainLink[];
  onRemoveCustom?: () => void;
  removingCustom?: boolean;
  className?: string;
};

/**
 * Open buttons for platform + custom storefront URLs, plus cancel for a linked
 * custom domain — driven by the backend `links[]` shape.
 */
const StoreDomainLinks = ({
  links,
  onRemoveCustom,
  removingCustom = false,
  className,
}: StoreDomainLinksProps) => {
  if (!links.length) return null;

  const hasCustom = links.some((link) => link.type === "custom");

  return (
    <div className={cn("space-y-3", className)}>
      <p className="text-[13px] font-medium text-slate-600 dark:text-slate-300">
        روابط المتجر
      </p>
      <div className="space-y-2">
        {links.map((link) => (
          <div
            key={link.type}
            className={cn(
              "flex items-center gap-2 rounded-2xl border px-3 py-2.5",
              link.primary
                ? "border-blue-200 bg-blue-50/70 dark:border-blue-900 dark:bg-blue-950/30"
                : "border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/50",
            )}
          >
            <div className="min-w-0 flex-1 text-right">
              <p className="text-[12px] text-slate-500 dark:text-slate-400">
                {link.label}
                {link.primary ? " · الرئيسي" : ""}
              </p>
              <code
                dir="ltr"
                className="block truncate text-sm font-medium text-slate-900 dark:text-slate-100"
                title={link.url}
              >
                {link.url.replace(/^https?:\/\//, "")}
              </code>
            </div>
            <Button
              type="button"
              variant="outline"
              asChild
              className="h-10 shrink-0 gap-1.5 rounded-xl px-3"
            >
              <a href={link.url} target="_blank" rel="noopener noreferrer">
                <HugeiconsIcon icon={Link01Icon} size={15} />
                فتح
              </a>
            </Button>
          </div>
        ))}
      </div>

      {hasCustom && onRemoveCustom && (
        <Button
          type="button"
          variant="outline"
          onClick={onRemoveCustom}
          disabled={removingCustom}
          className={cn(
            "h-11 w-full gap-2 rounded-2xl border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800",
            "dark:border-red-900 dark:text-red-300 dark:hover:bg-red-950/40",
          )}
        >
          {removingCustom ? (
            <HugeiconsIcon
              icon={Loading03Icon}
              size={16}
              className="animate-spin"
            />
          ) : (
            <HugeiconsIcon icon={Delete02Icon} size={16} />
          )}
          {removingCustom ? "جاري إلغاء النطاق المخصص..." : "إلغاء النطاق المخصص"}
        </Button>
      )}
    </div>
  );
};

export default StoreDomainLinks;
