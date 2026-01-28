import { useEffect, useState } from "react";
import { pdf } from "@react-pdf/renderer";
import { Download } from "lucide-react";
import { OrderInvoicePDF, type OrderInvoiceData } from "@/utils/files/invoice/order.invoice";

const STORAGE_KEY = "order-invoice-preview-data";

const STATUS_LABELS: Record<string, string> = {
  PENDING: "قيد الانتظار",
  PROCESSING: "قيد المعالجة",
  SHIPPED: "تم الشحن",
  DELIVERED: "تم التسليم",
  CANCELLED: "ملغي",
};

const formatCurrency = (amount: number) => {
  return (amount ?? 0).toLocaleString() + " د.ع";
};

const DELIVERY_FEE = 5000;

export default function OrderInvoicePreview() {
  const [order, setOrder] = useState<OrderInvoiceData | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as OrderInvoiceData;
        setOrder(parsed);
      }
    } catch {
      setOrder(null);
    }
  }, []);

  const handleDownloadPdf = async () => {
    if (!order) return;
    setIsDownloading(true);
    try {
      const blob = await pdf(
        <OrderInvoicePDF order={order} />
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `order-invoice-${String(order.id).slice(0, 8)}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } finally {
      setIsDownloading(false);
    }
  };

  if (order === null) {
    return (
      <div
        className="min-h-screen bg-gray-50 flex items-center justify-center p-6"
        dir="rtl"
      >
        <div className="text-center text-gray-600">
          <p className="text-lg font-medium">لا توجد بيانات للفاتورة</p>
          <p className="text-sm mt-2">يرجى فتح الفاتورة من صفحة تفاصيل الطلب.</p>
          <button
            type="button"
            onClick={() => window.close()}
            className="mt-4 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
          >
            إغلاق
          </button>
        </div>
      </div>
    );
  }

  const customer = order.customer?.user;
  const products = order.products ?? [];
  const subtotal = products.reduce(
    (sum, p) => sum + (p.price ?? 0) * (p.quantity ?? 0),
    0
  );
  const total = subtotal + DELIVERY_FEE;
  const statusLabel =
    STATUS_LABELS[(order.status || "").toUpperCase()] || order.status || "—";
  const addressParts = [
    order.nearest_point,
    order.region?.name?.arabic,
    order.state?.name?.arabic,
    order.country?.name?.ar,
  ].filter(Boolean);
  const deliveryAddress = addressParts.join("، ") || "—";
  const createdDate = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString("ar-IQ")
    : "—";

  return (
    <div
      className="min-h-screen bg-gray-50 text-gray-900 p-6 sm:p-8"
      dir="rtl"
    >
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8 pb-6 border-b-2 border-blue-600">
          <h1 className="text-2xl font-bold text-blue-700 text-center">
            فاتورة الطلب
          </h1>
          <p className="text-center text-gray-500 text-sm mt-2">
            رقم الطلب: #{String(order.id).slice(0, 8)} — تاريخ: {createdDate}
          </p>
        </div>

        {/* Download PDF button */}
        <div className="mb-8 flex justify-center">
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={isDownloading}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-xl shadow-lg transition-colors"
          >
            <Download className="w-5 h-5" />
            {isDownloading ? "جاري التوليد..." : "تحميل الفاتورة PDF"}
          </button>
        </div>

        {/* Status */}
        <section className="mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-3">حالة الطلب</h2>
          <span className="inline-block px-4 py-2 rounded-lg bg-blue-100 text-blue-800 font-semibold">
            {statusLabel}
          </span>
        </section>

        {/* Customer */}
        <section className="mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
            <span className="w-1 h-5 bg-blue-500 rounded" />
            معلومات العميل
          </h2>
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500">الاسم</span>
              <span className="font-semibold">{customer?.name || "—"}</span>
            </div>
            {customer?.phone && (
              <div className="flex justify-between">
                <span className="text-gray-500">الهاتف</span>
                <span>{customer.phone}</span>
              </div>
            )}
            {customer?.email && (
              <div className="flex justify-between">
                <span className="text-gray-500">البريد الإلكتروني</span>
                <span>{customer.email}</span>
              </div>
            )}
          </div>
        </section>

        {/* Delivery address */}
        <section className="mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
            <span className="w-1 h-5 bg-blue-500 rounded" />
            عنوان التوصيل
          </h2>
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <p className="text-right">{deliveryAddress}</p>
          </div>
        </section>

        {/* Notes */}
        {order.note && (
          <section className="mb-6">
            <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
              <span className="w-1 h-5 bg-blue-500 rounded" />
              ملاحظات الطلب
            </h2>
            <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
              <p className="text-right">{order.note}</p>
            </div>
          </section>
        )}

        {/* Products */}
        <section className="mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
            <span className="w-1 h-5 bg-blue-500 rounded" />
            تفاصيل المنتجات
          </h2>
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
            <table className="w-full text-right">
              <thead>
                <tr className="bg-blue-700 text-white">
                  <th className="p-3 font-semibold">المنتج</th>
                  <th className="p-3 font-semibold">السعر</th>
                  <th className="p-3 font-semibold">الكمية</th>
                  <th className="p-3 font-semibold">المجموع</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-4 text-gray-500">
                      لا توجد منتجات
                    </td>
                  </tr>
                ) : (
                  products.map((p, i) => {
                    const qty = p.quantity ?? 0;
                    const price = p.price ?? 0;
                    const lineTotal = qty * price;
                    const variantLabel =
                      p.variant?.optionValues
                        ?.map((o) => o.label || o.value)
                        .filter(Boolean)
                        .join(" / ") || "";
                    const title =
                      (p.product?.title || "منتج") +
                      (variantLabel ? ` (${variantLabel})` : "");
                    return (
                      <tr
                        key={p.id || i}
                        className={i % 2 === 1 ? "bg-gray-50" : ""}
                      >
                        <td className="p-3">{title}</td>
                        <td className="p-3">{formatCurrency(price)}</td>
                        <td className="p-3">{qty}</td>
                        <td className="p-3 font-semibold">
                          {formatCurrency(lineTotal)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
            <div className="p-4 border-t border-gray-200 space-y-2">
              <div className="flex justify-between text-gray-700">
                <span>المجموع الفرعي</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>التوصيل</span>
                <span>{formatCurrency(DELIVERY_FEE)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-blue-700 pt-2 border-t">
                <span>الإجمالي</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>
          </div>
        </section>

        <div className="flex justify-center pb-6">
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={isDownloading}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-xl shadow-lg transition-colors"
          >
            <Download className="w-5 h-5" />
            {isDownloading ? "جاري التوليد..." : "تحميل الفاتورة PDF"}
          </button>
        </div>
      </div>
    </div>
  );
}

export const ORDER_INVOICE_PREVIEW_STORAGE_KEY = STORAGE_KEY;
