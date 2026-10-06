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
          <p className="mt-0.5 text-xs text-slate-400 dark:text-[#a4b1fa]">
            البيانات في عمود واحد لسهولة القراءة على الهاتف
          </p>
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
                  <dd className="text-sm font-bold text-slate-900 dark:text-[#e4e7fc]">
                    <Ltr>
                      {formatCurrency(lineUnitPrice(item) * lineQuantity(item))}
                    </Ltr>
                  </dd>
                  <dt className="text-sm text-slate-500 dark:text-[#a4b1fa]">
                    أجمالي السعر
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
              <th className={th}>معلومات الفئة</th>
              <th className={cn(th, "w-20")}>عدد</th>
              <th className={cn(th, "w-32")}>سعر مفرد</th>
              <th className={cn(th, "w-36")}>أجمالي السعر</th>
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
                  <Ltr>
                    {formatCurrency(lineUnitPrice(item) * lineQuantity(item))}
                  </Ltr>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 shrink-0 border-t border-slate-100 pt-4 dark:border-white/6">
        <Pagination {...paginationProps} />
      </div>
    </section>
  );
};

export default OrderDetailsItems;
