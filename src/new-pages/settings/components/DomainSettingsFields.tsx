import { useEffect, useMemo, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  CancelCircleIcon,
  CheckmarkCircle02Icon,
  Loading03Icon,
  Search01Icon,
} from "@hugeicons-pro/core-stroke-rounded";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { SettingsLabel } from "./SettingsField";
import DomainPriceBreakdown from "./DomainPriceBreakdown";
import { DomainPreview } from "./DomainNotes";
import type { DynadotSearchResult } from "@/api/endpoints/dynadot.endpoints";
import type { DomainType } from "@/hooks/useDomainCheck";
import { filterDomainInput } from "@/utils/helpers";

/** Common TLDs shown beside the buy-domain name field. */
const DOMAIN_TLDS = [
  ".com",
  ".org",
  ".io",
  ".net",
  ".co",
  ".shop",
  ".store",
  ".online",
  ".app",
  ".dev",
  ".xyz",
  ".info",
  ".me",
  ".biz",
  ".site",
  ".tech",
] as const;

function splitCustomDomain(value: string): { name: string; tld: string } {
  const raw =
    value
      .trim()
      .toLowerCase()
      .replace(/^https?:\/\//, "")
      .split("/")[0] || "";
  if (!raw) return { name: "", tld: ".com" };
  const match = DOMAIN_TLDS.find(
    (tld) => raw === tld.slice(1) || raw.endsWith(tld),
  );
  if (match && raw.endsWith(match)) {
    return { name: raw.slice(0, -match.length).replace(/\.$/, ""), tld: match };
  }
  if (raw.includes(".")) {
    const i = raw.indexOf(".");
    return { name: raw.slice(0, i), tld: raw.slice(i) || ".com" };
  }
  return { name: raw, tld: ".com" };
}

type DomainSettingsFieldsProps = {
  domain: string;
  domainType: DomainType;
  domainChecked: boolean;
  domainAvailable: boolean | null;
  isCheckingDomain: boolean;
  dynadotResult: DynadotSearchResult | null;
  onDomainChange: (value: string) => void;
  onCheck: () => void;
  /** Locks the slug field and availability check (e.g. rename cooldown). */
  disabled?: boolean;
};

/**
 * Input plus availability check for one domain, shared by the subdomain and
 * buy paths. Which path is active is chosen above this component, so there is
 * no type picker here.
 */
const DomainSettingsFields = ({
  domain,
  domainType,
  domainChecked,
  domainAvailable,
  isCheckingDomain,
  dynadotResult,
  onDomainChange,
  onCheck,
  disabled = false,
}: DomainSettingsFieldsProps) => {
  const isSubdomain = domainType === "subdomain";
  const parsed = useMemo(() => splitCustomDomain(domain), [domain]);
  const [tld, setTld] = useState(parsed.tld);
  const [name, setName] = useState(parsed.name);

  useEffect(() => {
    setName(parsed.name);
    setTld(
      DOMAIN_TLDS.includes(parsed.tld as (typeof DOMAIN_TLDS)[number])
        ? parsed.tld
        : parsed.tld.startsWith(".")
          ? parsed.tld
          : ".com",
    );
  }, [parsed.name, parsed.tld]);

  const pushCustom = (nextName: string, nextTld: string) => {
    const cleanName = filterDomainInput(nextName).replace(/\./g, "");
    setName(cleanName);
    setTld(nextTld);
    onDomainChange(cleanName ? `${cleanName}${nextTld}` : "");
  };

  const slug = domain.trim().toLowerCase();
  const previewHost = isSubdomain
    ? slug
      ? `${slug}.mel.iq`
      : ""
    : name
      ? `${name}${tld}`
      : "";

  return (
    <div className={cn("space-y-5", disabled && "opacity-70")}>
      <div className="space-y-2">
        <SettingsLabel
          htmlFor="domain-input"
          className="text-slate-900 dark:text-slate-100"
        >
          {isSubdomain ? "اسم الدومين الفرعي" : "الدومين المخصص"}
        </SettingsLabel>

        {isSubdomain ? (
          /* Suffix sits left of the field: read right-to-left it follows the
             name, and the preview below spells the result out in full. */
          <div
            className={cn(
              "flex h-14 overflow-hidden rounded-2xl bg-slate-100 focus-within:ring-2 focus-within:ring-blue-500/30 dark:bg-slate-900",
              disabled && "pointer-events-none",
            )}
          >
            <span
              dir="ltr"
              className="flex shrink-0 items-center bg-slate-200/70 px-4 text-[15px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300"
            >
              .mel.iq
            </span>
            <input
              id="domain-input"
              value={domain}
              onChange={(e) =>
                onDomainChange(filterDomainInput(e.target.value))
              }
              placeholder="example"
              dir="ltr"
              disabled={disabled}
              className="min-w-0 flex-1 border-0 bg-transparent px-4 text-left text-[15px] text-slate-900 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed dark:text-slate-100 dark:placeholder:text-slate-500"
            />
          </div>
        ) : (
          <div
            dir="ltr"
            className={cn("flex gap-2", disabled && "pointer-events-none")}
          >
            <div className="flex h-14 min-w-0 flex-1 overflow-hidden rounded-2xl bg-slate-100 focus-within:ring-2 focus-within:ring-blue-500/30 dark:bg-slate-900">
              <input
                id="domain-input"
                value={name}
                onChange={(e) => pushCustom(e.target.value, tld)}
                placeholder="mystore"
                dir="ltr"
                disabled={disabled}
                className="min-w-0 flex-1 border-0 bg-transparent px-4 text-left text-[15px] text-slate-900 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed dark:text-slate-100 dark:placeholder:text-slate-500"
              />
              <span className="flex shrink-0 items-center bg-slate-200/70 px-3 text-[15px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {tld}
              </span>
            </div>

            <div
              className={cn(
                "custom-scrollbar flex h-40 w-[5.5rem] shrink-0 flex-col gap-1 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-1.5",
                "dark:border-slate-700 dark:bg-slate-900",
              )}
              role="listbox"
              aria-label="امتداد الدومين"
            >
              {DOMAIN_TLDS.map((item) => {
                const selected = tld === item;
                return (
                  <button
                    key={item}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    disabled={disabled}
                    onClick={() => pushCustom(name, item)}
                    className={cn(
                      "rounded-xl px-2 py-1.5 text-left text-[13px] font-medium transition-colors",
                      selected
                        ? "bg-[#00b7ff]/15 text-[#008fc7] dark:bg-[#00b7ff]/20 dark:text-[#33c5ff]"
                        : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800",
                    )}
                  >
                    {item}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <SettingsLabel className="text-slate-900 dark:text-slate-100">
          معاينة الدومين
        </SettingsLabel>
        <DomainPreview
          host={previewHost}
          placeholder={isSubdomain ? "example.mel.iq" : "example.com"}
        />
      </div>

      {/* The inputs above are filled, borderless and the same radius, so a
          plain secondary button here reads as a third field. Tinted, bordered
          and led by an icon, it reads as something to press. */}
      <Button
        type="button"
        onClick={onCheck}
        disabled={
          disabled ||
          !(isSubdomain ? domain.trim() : name.trim()) ||
          isCheckingDomain
        }
        className={cn(
          "h-12 w-full gap-2 rounded-2xl border font-semibold shadow-none",
          "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800",
          "dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300 dark:hover:bg-blue-900/50",
        )}
      >
        {isCheckingDomain ? (
          <>
            <HugeiconsIcon
              icon={Loading03Icon}
              size={16}
              className="animate-spin"
            />
            جاري التحقق...
          </>
        ) : (
          <>
            <HugeiconsIcon icon={Search01Icon} size={16} />
            التحقق من توفر الدومين
          </>
        )}
      </Button>

      {isSubdomain && domainChecked && (
        <p
          className={cn(
            "flex items-center gap-1.5 px-1 text-[13px]",
            domainAvailable
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-red-600 dark:text-red-400",
          )}
        >
          {domainAvailable ? (
            <HugeiconsIcon icon={CheckmarkCircle02Icon} size={16} />
          ) : (
            <HugeiconsIcon icon={CancelCircleIcon} size={16} />
          )}
          {domainAvailable
            ? "النطاق متاح"
            : "النطاق غير متاح أو مستخدم بالفعل"}
        </p>
      )}

      {!isSubdomain && dynadotResult && (
        <div
          className={cn(
            "rounded-2xl border p-3 text-sm",
            dynadotResult.available && dynadotResult.supported
              ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200"
              : "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200",
          )}
        >
          <p className="font-medium" dir="ltr">
            {dynadotResult.domain}
          </p>
          <DomainPriceBreakdown result={dynadotResult} />
        </div>
      )}
    </div>
  );
};

export default DomainSettingsFields;
