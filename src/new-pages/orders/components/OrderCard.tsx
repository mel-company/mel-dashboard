/* eslint-disable @typescript-eslint/no-explicit-any */
import { cn } from "@/lib/utils";
import OrderProductStack from "./OrderProductStack";
import {
  formatOrderAmount,
  formatOrderCode,
  formatOrderDateParts,
  getOrderAddressLine,
  getOrderCity,
  getOrderPaymentLabel,
  getOrderStatusMeta,
  getOrderTotal,
} from "../utils";

type OrderCardProps = {
  order: any;
  imageBaseUrl?: string;
  calculateTotal: (products: any[]) => number;
  onClick: () => void;
  className?: string;
};

const OrderCard = ({
  order,
  imageBaseUrl,
  calculateTotal,
  onClick,
  className,
}: OrderCardProps) => {
  const customer = order.customer?.user;
  const status = getOrderStatusMeta(order.status);
  const payment = getOrderPaymentLabel(order);
  const { date, time } = formatOrderDateParts(order.createdAt);
  const total = getOrderTotal(order, calculateTotal);
  const city = getOrderCity(order);
  const address = getOrderAddressLine(order);

  return (
    <div
      className={cn(
        "flex w-full flex-col gap-3 rounded-[20px] bg-white p-4 text-right dark:bg-[#0a0e27]",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <span
          className={cn(
            "inline-flex items-center justify-center rounded-xl px-3 py-1.5 text-[13px] font-medium",
            status.className,
          )}
        >
          {status.label}
        </span>
        <span className="font-mono text-sm font-bold text-slate-900 dark:text-[#e4e7fc]">
          {formatOrderCode(order.id)}
        </span>
      </div>

      <div className="space-y-0.5">
        <h3 className="line-clamp-1 text-sm font-semibold text-slate-800 dark:text-[#e4e7fc]">
          {customer?.name ?? "—"}
        </h3>
        <p className="text-xs text-slate-500 dark:text-[#a4b1fa]" dir="ltr">
          {customer?.phone ?? "—"}
        </p>
      </div>

      <div className="min-w-0 space-y-0.5 text-right">
        <p className="text-sm leading-[1.5] text-slate-800 dark:text-[#e4e7fc]">
          {city}
        </p>
        {address && address !== "—" ? (
          <p className="truncate text-xs leading-[1.5] text-slate-500 dark:text-[#a4b1fa]">
            {address}
          </p>
        ) : null}
      </div>

      <OrderProductStack order={order} imageBaseUrl={imageBaseUrl} size="sm" />

      <div className="flex items-center justify-between gap-3">
        <div className="text-xs text-slate-500 dark:text-[#a4b1fa]">
          <p>{date}</p>
          <p dir="ltr">{time}</p>
        </div>
        <div className="text-left">
          <p className="text-sm font-bold text-slate-900 dark:text-[#e4e7fc]">
            {formatOrderAmount(total)}
          </p>
          {payment.label !== "—" ? (
            <p className={cn("text-xs", payment.className)}>{payment.label}</p>
          ) : null}
        </div>
      </div>

      <button
        type="button"
        onClick={onClick}
        className="flex h-10 w-full items-center justify-center rounded-xl bg-[#00b7ff]/5 text-sm font-bold text-[#00b7ff] transition hover:bg-[#00b7ff]/10"
      >
        التفاصيل
      </button>
    </div>
  );
};

export default OrderCard;
