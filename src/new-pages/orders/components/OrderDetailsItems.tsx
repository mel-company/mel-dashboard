/* eslint-disable @typescript-eslint/no-explicit-any */
import { Package } from "lucide-react";
import { cn } from "@/lib/utils";
import Ltr from "@/components/Ltr";
import { AssetImage } from "@/components/AssetImage";
import Pagination from "@/components/table/pagination";
import { useTablePagination } from "@/hooks/use-table-pagination";
import { formatCurrency, formatNumber } from "@/utils/format-currency";
import { getOrderLineImagePath } from "../utils";

type Props = {
  order: any;
  imageBaseUrl?: string | null;
  /** Mobile stacks each line into a card; desktop draws the table. */
  variant: "table" | "cards";
};

function lineName(item: any): string {
  return (
    item?.product?.name ??
    item?.variant?.product?.name ??
    item?.name ??
    "—"
  );
}

function lineDescription(item: any): string {
  return (
    item?.product?.description ??
    item?.variant?.product?.description ??
    item?.description ??
    ""
  );
}

function lineQuantity(item: any): number {
  return Number(item?.quantity) || 0;
}

function lineUnitPrice(item: any): number {
  return Number(item?.price) || 0;
}

/**
 * Which variant was bought («أحمر · XL»). Without it a merchant packing a
 * shirt ordered in three sizes could not tell the lines apart.
 */
function lineVariant(item: any): string {
  const values: any[] = item?.variant?.optionValues ?? [];
  return values
    .map((v) => String(v?.label ?? v?.value ?? "").trim())
    .filter(Boolean)
    .join(" · ");
}

/**
 * The line as the order is priced: after its product or category discount,
 * which the detail call returns per line. Price × quantity alone made the
 * lines add up to more than «سعر المنتجات» whenever a discount applied.
 */
function lineTotals(item: any): { total: number; before: number | null } {
  const before = lineUnitPrice(item) * lineQuantity(item);
  const after = Number(item?.lineTotalAfterDiscount);
  if (item?.lineTotalAfterDiscount == null || Number.isNaN(after)) {
    return { total: before, before: null };
  }
  return { total: after, before: after < before - 0.005 ? before : null };
}

const LineTotal = ({ item }: { item: any }) => {
  const { total, before } = lineTotals(item);
  return (
    <>
      <Ltr>{formatCurrency(total)}</Ltr>
      {before != null ? (
        <span className="block text-[11px] font-normal text-slate-400 line-through dark:text-[#a4b1fa]">
          <Ltr>{formatCurrency(before)}</Ltr>
        </span>
      ) : null}
    </>
  );
};

const LineVariant = ({ item }: { item: any }) => {
  const label = lineVariant(item);
  return label ? (
    <p className="mt-1 text-xs font-medium text-violet-600 dark:text-[#b282ff]">
      {label}
    </p>
  ) : null;
};

const Thumb = ({
  item,
  imageBaseUrl,
  className,
}: {
  item: any;
  imageBaseUrl?: string | null;
  className?: string;
}) => (
  <div
    className={cn(
      "flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white dark:bg-white",
      className,
    )}
  >
    <AssetImage
      image={getOrderLineImagePath(item)}
      baseUrl={imageBaseUrl}
      alt={lineName(item)}
      className="size-full object-contain"
      fallback={<Package className="size-5 text-slate-300" />}
    />
  </div>
);

const OrderDetailsItems = ({ order, imageBaseUrl, variant }: Props) => {
  const items: any[] = Array.isArray(order?.products) ? order.products : [];

  const { pageItems, paginationProps } = useTablePagination({
    items,
    defaultViewCount: variant === "table" ? 10 : 20,
  });

  if (!items.length) {
    return (
      <p className="rounded-2xl bg-slate-50 px-4 py-10 text-center text-sm text-slate-400 dark:bg-[#0a0e27] dark:text-[#a4b1fa]">
        لا توجد منتجات في هذا الطلب
      </p>
    );
  }

  if (variant === "cards") {
    return (
      <section className="rounded-[24px] bg-white p-4 dark:bg-[#0a0e27]">
        <header className="mb-4 text-right">
          <h3 className="text-lg font-bold text-slate-900 dark:text-[#e4e7fc]">
            المنتجات
          </h3>
        </header>

        <div className="flex flex-col gap-3">
          {pageItems.map((item: any, i: number) => (
            <article
              key={item?.id ?? i}
              className="rounded-2xl bg-slate-50 p-4 text-right dark:bg-[#12183b]"
            >
              <h4 className="text-[15px] font-bold text-slate-900 dark:text-[#e4e7fc]">
                {lineName(item)}
              </h4>
              <LineVariant item={item} />
              {lineDescription(item) ? (
                <p className="mt-1 line-clamp-1 text-xs text-slate-400 dark:text-[#a4b1fa]">
                  {lineDescription(item)}
                </p>
              ) : null}

              <dl className="mt-3 space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <dd className="text-sm text-slate-800 dark:text-[#e4e7fc]">
                    {formatNumber(lineQuantity(item))}
                  </dd>
                  <dt className="text-sm text-slate-500 dark:text-[#a4b1fa]">
                    عدد
                  </dt>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dd className="text-sm text-slate-800 dark:text-[#e4e7fc]">
                    <Ltr>{formatCurrency(lineUnitPrice(item))}</Ltr>
                  </dd>
                  <dt className="text-sm text-slate-500 dark:text-[#a4b1fa]">
                    سعر مفرد
                  </dt>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dd className="text-left text-sm font-bold text-slate-900 dark:text-[#e4e7fc]">
                    <LineTotal item={item} />
                  </dd>
                  <dt className="text-sm text-slate-500 dark:text-[#a4b1fa]">
                    إجمالي السعر
                  </dt>
                </div>
              </dl>

              <div className="mt-3 flex justify-start">
                <Thumb item={item} imageBaseUrl={imageBaseUrl} className="size-14" />
              </div>
            </article>
          ))}
        </div>

        {paginationProps.totalPages > 1 ? (
          <div className="mt-4 border-t border-slate-100 pt-4 dark:border-white/6">
            <Pagination {...paginationProps} />
          </div>
        ) : null}
      </section>
    );
  }

  const th =
    "px-3.5 py-3 text-right text-[13px] font-medium text-slate-500 dark:text-[#a4b1fa]";
  const td = "px-3.5 py-3 text-right align-middle";

  return (
    <section className="flex min-h-0 flex-col rounded-[24px] bg-white p-4 dark:bg-[#0a0e27]">
      <div className="min-h-0 flex-1 overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-slate-100 dark:border-[#1f2448]">
              <th className={cn(th, "w-20")}>الصورة</th>
              <th className={th}>المنتج</th>
              <th className={cn(th, "w-20")}>عدد</th>
              <th className={cn(th, "w-32")}>سعر مفرد</th>
              <th className={cn(th, "w-36")}>إجمالي السعر</th>
            </tr>
          </thead>
          <tbody>
            {pageItems.map((item: any, i: number) => (
              <tr
                key={item?.id ?? i}
                className="border-b border-slate-50 last:border-0 dark:border-[#12183b]"
              >
                <td className={td}>
                  <Thumb item={item} imageBaseUrl={imageBaseUrl} />
                </td>
                <td className={td}>
                  <p className="text-sm font-semibold text-slate-900 dark:text-[#e4e7fc]">
                    {lineName(item)}
                  </p>
                  <LineVariant item={item} />
                  {lineDescription(item) ? (
                    <p className="mt-0.5 line-clamp-1 text-xs text-slate-400 dark:text-[#a4b1fa]">
                      {lineDescription(item)}
                    </p>
                  ) : null}
                </td>
                <td className={cn(td, "tabular-nums text-sm text-slate-800 dark:text-[#e4e7fc]")}>
                  {formatNumber(lineQuantity(item))}
                </td>
                <td className={cn(td, "text-sm text-slate-800 dark:text-[#e4e7fc]")}>
                  <Ltr>{formatCurrency(lineUnitPrice(item))}</Ltr>
                </td>
                <td className={cn(td, "text-sm font-bold text-slate-900 dark:text-[#e4e7fc]")}>
                  <LineTotal item={item} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {paginationProps.totalPages > 1 ? (
        <div className="mt-4 shrink-0 border-t border-slate-100 pt-4 dark:border-white/6">
          <Pagination {...paginationProps} />
        </div>
      ) : null}
    </section>
  );
};

export default OrderDetailsItems;
