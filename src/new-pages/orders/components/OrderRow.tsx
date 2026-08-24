/* eslint-disable @typescript-eslint/no-explicit-any */
import { Link } from "react-router-dom";
import { TableCell, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { File01Icon } from "@hugeicons-pro/core-stroke-rounded";
import { HugeiconsIcon } from "@hugeicons/react";
import OrderProductStack from "./OrderProductStack";
import {
  formatOrderAmount,
  formatOrderCode,
  formatOrderDateParts,
  getOrderAddressLine,
  getOrderCity,
  getOrderDiscountPercent,
  getOrderPaymentLabel,
  getOrderStatusMeta,
  getOrderTotal,
} from "../utils";

type OrderRowProps = {
  order: any;
  imageBaseUrl?: string;
  calculateTotal: (products: any[]) => number;
  onOpen: (id: string) => void;
};

const OrderRow = ({
  order,
  imageBaseUrl,
  calculateTotal,
  onOpen,
}: OrderRowProps) => {
  const tdClass = "whitespace-normal px-3.5 py-3.5 text-right align-middle";
  const customer = order.customer?.user;
  const status = getOrderStatusMeta(order.status);
  const payment = getOrderPaymentLabel(order);
  const { date, time } = formatOrderDateParts(order.createdAt);
  const total = getOrderTotal(order, calculateTotal);
  const city = getOrderCity(order);
  const address = getOrderAddressLine(order);
  const discountPercent = getOrderDiscountPercent(order);

  return (
    <TableRow
      className="cursor-pointer border-b border-slate-100 transition-colors hover:bg-slate-50 dark:border-[#12183b] dark:hover:bg-white/3"
      onClick={() => onOpen(order.id)}
    >
      <TableCell className={cn(tdClass, "font-mono text-sm font-semibold text-slate-800 dark:text-[#e4e7fc]")}>
        {formatOrderCode(order.id)}
      </TableCell>

      <TableCell className={tdClass}>
        <p className="font-semibold text-slate-900 dark:text-[#f0f2ff]">
          {customer?.name ?? "—"}
        </p>
        <p className="mt-0.5 text-sm text-slate-500 dark:text-[#a4b1fa]" dir="ltr">
          {customer?.phone ?? "—"}
        </p>
      </TableCell>

      <TableCell className={tdClass}>
        <div className="flex min-w-0 flex-col items-end text-right">
          <p className="w-full text-[14px] leading-[1.5] text-slate-800 dark:text-[#e4e7fc]">
            {city}
          </p>
          {address && address !== "—" ? (
            <p className="w-full truncate text-[12px] leading-[1.5] text-slate-500 dark:text-[#a4b1fa]">
              {address}
            </p>
          ) : null}
        </div>
      </TableCell>

      <TableCell className={tdClass}>
        <OrderProductStack order={order} imageBaseUrl={imageBaseUrl} />
      </TableCell>

      <TableCell className={cn(tdClass, "text-center")}>
        <div className="flex flex-col items-center gap-0.5">
          <span className="font-semibold text-sm tabular-nums text-slate-900 dark:text-[#f0f2ff]">
            {formatOrderAmount(total)}
          </span>
          {discountPercent != null ? (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-500">
              {discountPercent}%
              <span aria-hidden>↘</span>
            </span>
          ) : payment.label !== "—" ? (
            <span className={cn("text-sm", payment.className)}>{payment.label}</span>
          ) : null}
        </div>
      </TableCell>

      <TableCell className={tdClass}>
        <p className="text-sm font-medium text-slate-800 dark:text-[#e4e7fc]">{date}</p>
        <p className="mt-0.5 text-xs text-slate-500 dark:text-[#a4b1fa]" dir="ltr">
          {time}
        </p>
      </TableCell>

      <TableCell className={tdClass}>
        <span
          className={cn(
            "inline-flex items-center justify-center rounded-xl px-3 py-1.5 text-[13px] font-medium",
            status.className,
          )}
        >
          {status.label}
        </span>
      </TableCell>

      <TableCell className={tdClass} onClick={(e) => e.stopPropagation()}>
        <Link
          to={`/orders/${order.id}`}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#00b7ff]/5 px-3 text-sm font-semibold text-[#00b7ff] transition hover:bg-[#00b7ff]/10"
        >
          <HugeiconsIcon icon={File01Icon} size={18} />
          التفاصيل
        </Link>
      </TableCell>
    </TableRow>
  );
};

export default OrderRow;
