/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react";
import { pdf } from "@react-pdf/renderer";
import { Download, Loader2, Printer } from "lucide-react";
import { OrderInvoicePDF } from "@/utils/files/invoice/order.invoice";
import {
  buildOrderInvoice,
  type OrderInvoice,
  type InvoiceStore,
} from "@/utils/files/invoice/order-invoice-model";
import { useFetchStoreDetails } from "@/api/wrappers/store.wrappers";
import { formatCurrency } from "@/utils/format-currency";
import Ltr from "@/components/Ltr";

const STORAGE_KEY = "order-invoice-preview-data";

const Money = ({ value }: { value: number }) => (
  <span className="whitespace-nowrap">
    <Ltr>{formatCurrency(value)}</Ltr>
  </span>
);

const TotalRow = ({
  label,
  value,
  negative,
}: {
  label: string;
  value: number;
  negative?: boolean;
}) => (
  <div className="flex items-center justify-between py-1.5 text-sm">
    <span className="text-slate-500">{label}</span>
    <span className="font-semibold text-slate-800">
      {negative ? <Ltr>- {formatCurrency(value)}</Ltr> : <Money value={value} />}
    </span>
  </div>
);

/** The paper itself — what prints, and what the PDF mirrors. */
const InvoicePaper = ({
  invoice,
  store,
}: {
  invoice: OrderInvoice;
  store: InvoiceStore;
}) => (
  <article className="mx-auto w-full max-w-[820px] bg-white px-6 py-8 text-slate-800 shadow-sm ring-1 ring-slate-200 sm:px-10 sm:py-10 print:max-w-none print:px-0 print:py-0 print:shadow-none print:ring-0">
    {/* RTL: the store leads on the right, the invoice's own facts sit left. */}
    <header className="flex flex-wrap items-start justify-between gap-6 border-b border-slate-200 pb-6">
      <div className="flex items-center gap-3">
        {store.logo ? (
          <img
            src={store.logo}
            alt=""
            className="size-14 rounded-xl object-contain ring-1 ring-slate-200"
          />
        ) : null}
        <div>
          <p className="text-xl font-bold text-slate-900">
            {store.name || "المتجر"}
          </p>
          {store.phone ? (
            <p className="mt-0.5 text-sm text-slate-500">
              <Ltr>{store.phone}</Ltr>
            </p>
          ) : null}
        </div>
      </div>
      <div className="text-left">
        <p className="text-2xl font-bold text-slate-900">فاتورة</p>
        <p className="mt-1 text-sm font-semibold text-slate-700">
          <Ltr>{invoice.code}</Ltr>
        </p>
        <p className="text-sm text-slate-500">
          <Ltr>{invoice.date}</Ltr>
        </p>
      </div>
    </header>

    <section className="grid gap-6 border-b border-slate-200 py-6 sm:grid-cols-2">
      <div>
        <p className="mb-2 text-xs font-semibold text-slate-400">إلى</p>
        <p className="font-bold text-slate-900">{invoice.customerName}</p>
        {invoice.customerPhone ? (
          <p className="text-sm text-slate-600">
            <Ltr>{invoice.customerPhone}</Ltr>
          </p>
        ) : null}
        {invoice.address ? (
          <p className="mt-1 text-sm text-slate-600">{invoice.address}</p>
        ) : null}
        {invoice.nearestPoint ? (
          <p className="text-sm text-slate-600">{invoice.nearestPoint}</p>
        ) : null}
      </div>
      <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1.5 self-start text-sm">
        <dt className="text-slate-400">حالة الطلب</dt>
        <dd className="font-semibold text-slate-800">{invoice.status}</dd>
        {invoice.payment ? (
          <>
            <dt className="text-slate-400">طريقة الدفع</dt>
            <dd className="font-semibold text-slate-800">{invoice.payment}</dd>
          </>
        ) : null}
        <dt className="text-slate-400">عدد القطع</dt>
        <dd className="font-semibold text-slate-800">
          {invoice.lines.reduce((sum, l) => sum + l.quantity, 0)}
        </dd>
      </dl>
    </section>

    <table className="mt-6 w-full text-right text-sm">
      <thead>
        <tr className="bg-slate-100 text-xs text-slate-500">
          <th className="w-8 px-2 py-2.5 sm:px-3 font-semibold">#</th>
          <th className="px-2 py-2.5 sm:px-3 font-semibold">المنتج</th>
          <th className="px-2 py-2.5 sm:px-3 text-center font-semibold">الكمية</th>
          <th className="px-2 py-2.5 sm:px-3 font-semibold">سعر الوحدة</th>
          <th className="px-2 py-2.5 sm:px-3 font-semibold">المجموع</th>
        </tr>
      </thead>
      <tbody>
        {invoice.lines.length === 0 ? (
          <tr>
            <td colSpan={5} className="px-3 py-6 text-center text-slate-400">
              لا توجد منتجات
            </td>
          </tr>
        ) : (
          invoice.lines.map((line, index) => (
            <tr key={line.key} className="border-b border-slate-100">
              <td className="px-2 py-3 sm:px-3 text-slate-400">{index + 1}</td>
              <td className="px-2 py-3 sm:px-3">
                <p className="font-semibold text-slate-900">{line.name}</p>
                {line.variant ? (
                  <p className="text-xs text-slate-500">{line.variant}</p>
                ) : null}
              </td>
              <td className="px-2 py-3 sm:px-3 text-center">{line.quantity}</td>
              <td className="px-2 py-3 sm:px-3 text-slate-600">
                <Money value={line.unitPrice} />
              </td>
              <td className="px-2 py-3 sm:px-3 font-semibold text-slate-900">
                <Money value={line.total} />
                {line.before != null ? (
                  <span className="block whitespace-nowrap text-xs font-normal text-slate-400 line-through">
                    <Money value={line.before} />
                  </span>
                ) : null}
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>

    <section className="mt-6 flex flex-wrap items-start justify-between gap-6">
      <div className="min-w-0 flex-1">
        {invoice.note ? (
          <>
            <p className="mb-1 text-xs font-semibold text-slate-400">ملاحظات</p>
            <p className="text-sm leading-relaxed text-slate-600">
              {invoice.note}
            </p>
          </>
        ) : null}
      </div>
      <div className="w-full sm:w-72">
        <TotalRow label="المجموع الفرعي" value={invoice.subtotal} />
        {invoice.productDiscount > 0 ? (
          <TotalRow
            label="خصم المنتجات"
            value={invoice.productDiscount}
            negative
          />
        ) : null}
        {invoice.couponDiscount > 0 ? (
          <TotalRow
            label="خصم الكوبون"
            value={invoice.couponDiscount}
            negative
          />
        ) : null}
        <TotalRow label="التوصيل" value={invoice.delivery} />
        <div className="mt-2 flex items-center justify-between border-t-2 border-slate-900 pt-3">
          <span className="font-bold text-slate-900">الإجمالي</span>
          <span className="text-xl font-bold text-slate-900">
            <Money value={invoice.total} />
          </span>
        </div>
      </div>
    </section>

    <footer className="mt-10 border-t border-slate-200 pt-4 text-center text-xs text-slate-400">
      شكراً لتسوقكم{store.name ? ` من ${store.name}` : ""}
    </footer>
  </article>
);

export default function OrderInvoicePreview() {
  const [order, setOrder] = useState<any | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const { data: storeDetails } = useFetchStoreDetails();

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) setOrder(JSON.parse(raw));
    } catch {
      setOrder(null);
    }
  }, []);

  const invoice = useMemo(
    () => (order ? buildOrderInvoice(order) : null),
    [order],
  );
  const store: InvoiceStore = {
    name: storeDetails?.name,
    logo: storeDetails?.logo,
    phone: storeDetails?.phone,
  };

  const handleDownloadPdf = async () => {
    if (!invoice) return;
    setIsDownloading(true);
    try {
      const blob = await pdf(
        <OrderInvoicePDF invoice={invoice} store={store} />,
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `invoice-${invoice.code.replace("#", "")}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } finally {
      setIsDownloading(false);
    }
  };

  if (!invoice) {
    return (
      <div
        className="flex min-h-screen items-center justify-center bg-slate-100 p-6"
        dir="rtl"
      >
        <div className="text-center text-slate-600">
          <p className="text-lg font-medium">لا توجد بيانات للفاتورة</p>
          <p className="mt-2 text-sm">افتح الفاتورة من تفاصيل الطلب.</p>
          <button
            type="button"
            onClick={() => window.close()}
            className="mt-4 rounded-lg bg-slate-200 px-4 py-2 hover:bg-slate-300"
          >
            إغلاق
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-slate-100 px-3 py-6 sm:px-6 print:bg-white print:p-0"
      dir="rtl"
    >
      <div className="mx-auto mb-4 flex max-w-[820px] flex-wrap items-center justify-end gap-2 print:hidden">
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-800 hover:bg-slate-50"
        >
          <Printer className="size-4" />
          طباعة
        </button>
        <button
          type="button"
          onClick={handleDownloadPdf}
          disabled={isDownloading}
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-sky-600 px-4 text-sm font-semibold text-white hover:bg-sky-700 disabled:opacity-60"
        >
          {isDownloading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Download className="size-4" />
          )}
          تحميل PDF
        </button>
      </div>
      <InvoicePaper invoice={invoice} store={store} />
    </div>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const ORDER_INVOICE_PREVIEW_STORAGE_KEY = STORAGE_KEY;
