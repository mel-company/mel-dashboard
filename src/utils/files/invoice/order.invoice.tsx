import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import CairoRegular from "../../../assets/fonts/Cairo-Regular.ttf";
import CairoBold from "../../../assets/fonts/Cairo-Bold.ttf";
import { formatDate } from "../../helpers";

Font.register({
  family: "Cairo",
  fonts: [
    { src: CairoRegular, fontWeight: 400 },
    { src: CairoBold, fontWeight: 700 },
  ],
});

const STATUS_LABELS: Record<string, string> = {
  PENDING: "قيد الانتظار",
  PROCESSING: "قيد المعالجة",
  SHIPPED: "تم الشحن",
  DELIVERED: "تم التسليم",
  CANCELLED: "ملغي",
};

const styles = StyleSheet.create({
  page: {
    padding: 36,
    direction: "rtl",
    fontFamily: "Cairo",
    backgroundColor: "#ffffff",
    fontSize: 11,
  },
  header: {
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: "#1e40af",
  },
  title: {
    fontSize: 22,
    fontWeight: 700,
    color: "#1e40af",
    textAlign: "center",
    marginBottom: 6,
  },
  orderId: {
    fontSize: 12,
    color: "#6b7280",
    textAlign: "center",
  },
  section: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 700,
    color: "#1f2937",
    marginBottom: 10,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    textAlign: "right",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
    paddingVertical: 4,
  },
  label: {
    fontSize: 10,
    color: "#6b7280",
    width: "35%",
    textAlign: "right",
  },
  value: {
    fontSize: 11,
    color: "#1f2937",
    fontWeight: 700,
    width: "65%",
    textAlign: "right",
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 4,
    alignSelf: "flex-end",
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: 700,
    color: "#1f2937",
  },
  statusPending: { backgroundColor: "#fef3c7", color: "#92400e" },
  statusProcessing: { backgroundColor: "#dbeafe", color: "#1e40af" },
  statusShipped: { backgroundColor: "#ede9fe", color: "#5b21b6" },
  statusDelivered: { backgroundColor: "#d1fae5", color: "#065f46" },
  statusCancelled: { backgroundColor: "#fee2e2", color: "#991b1b" },
  infoBox: {
    backgroundColor: "#f9fafb",
    padding: 12,
    borderRadius: 4,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 10,
    color: "#4b5563",
    lineHeight: 1.6,
    textAlign: "right",
  },
  table: {
    marginTop: 8,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#1e40af",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderTopRightRadius: 4,
    borderTopLeftRadius: 4,
  },
  tableHeaderCell: {
    fontSize: 9,
    fontWeight: 700,
    color: "#ffffff",
    flex: 1,
    textAlign: "right",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  tableRowAlt: {
    backgroundColor: "#f9fafb",
  },
  tableCell: {
    fontSize: 9,
    color: "#374151",
    flex: 1,
    textAlign: "right",
  },
  totalsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#f3f4f6",
    borderRadius: 4,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    paddingTop: 12,
    paddingBottom: 12,
    paddingHorizontal: 14,
    backgroundColor: "#1e40af",
    borderRadius: 4,
  },
  totalLabel: {
    fontSize: 12,
    color: "#ffffff",
    fontWeight: 700,
  },
  totalValue: {
    fontSize: 14,
    color: "#ffffff",
    fontWeight: 700,
  },
  footer: {
    marginTop: 28,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    textAlign: "center",
  },
  footerText: {
    fontSize: 9,
    color: "#9ca3af",
    lineHeight: 1.5,
  },
});

const formatCurrency = (amount: number) => {
  return (amount ?? 0).toLocaleString() + " د.ع";
};

const getStatusStyle = (status: string) => {
  const s = (status || "").toUpperCase();
  if (s === "PENDING") return styles.statusPending;
  if (s === "PROCESSING") return styles.statusProcessing;
  if (s === "SHIPPED") return styles.statusShipped;
  if (s === "DELIVERED") return styles.statusDelivered;
  if (s === "CANCELLED") return styles.statusCancelled;
  return styles.statusPending;
};

export type OrderInvoiceData = {
  id: string;
  status?: string;
  createdAt?: string;
  note?: string;
  nearest_point?: string;
  country?: { name?: { ar?: string } };
  state?: { name?: { arabic?: string } };
  region?: { name?: { arabic?: string } };
  customer?: {
    id?: string;
    user?: {
      name?: string;
      phone?: string;
      email?: string;
      location?: string;
    };
  };
  products?: Array<{
    id?: string;
    quantity?: number;
    price?: number;
    product?: { title?: string };
    variant?: { optionValues?: Array<{ label?: string; value?: string }> };
  }>;
};

const DELIVERY_FEE = 5000;

export const OrderInvoicePDF = ({
  order,
  store,
}: {
  order: OrderInvoiceData;
  store?: { name?: string; address?: string; phone?: string; email?: string };
}) => {
  const customer = order.customer?.user;
  const products = order.products ?? [];
  const subtotal = products.reduce(
    (sum, p) => sum + (p.price ?? 0) * (p.quantity ?? 0),
    0
  );
  const total = subtotal + DELIVERY_FEE;
  const statusLabel =
    STATUS_LABELS[(order.status || "").toUpperCase()] || order.status || "—";
  const statusStyle = getStatusStyle(order.status || "");

  const addressParts = [
    order.nearest_point,
    order.region?.name?.arabic,
    order.state?.name?.arabic,
    order.country?.name?.ar,
  ].filter(Boolean);
  const deliveryAddress = addressParts.join("، ") || "—";

  const createdDate = order.createdAt
    ? formatDate(order.createdAt)?.date || order.createdAt
    : "—";

  return (
    <Document title={`فاتورة طلب #${String(order.id).slice(0, 8)}`}>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          {store?.name && (
            <Text
              style={{
                fontSize: 14,
                color: "#6b7280",
                textAlign: "right",
                marginBottom: 4,
              }}
            >
              {store.name}
            </Text>
          )}
          <Text style={styles.title}>فاتورة الطلب</Text>
          <Text style={styles.orderId}>
            تاريخ: {createdDate}
          </Text>
        </View>

        {/* Order status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>حالة الطلب</Text>
          <View style={styles.row}>
            <View style={[styles.statusBadge, statusStyle]}>
              <Text style={styles.statusBadgeText}>{statusLabel}</Text>
            </View>
            <Text style={styles.label}>الحالة</Text>
          </View>
        </View>

        {/* Customer / User */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>معلومات العميل</Text>
          <View style={styles.row}>
            <Text style={styles.value}>{customer?.name || "—"}</Text>
            <Text style={styles.label}>الاسم</Text>
          </View>
          {customer?.phone && (
            <View style={styles.row}>
              <Text style={styles.value}>{customer.phone}</Text>
              <Text style={styles.label}>الهاتف</Text>
            </View>
          )}
          {customer?.email && (
            <View style={styles.row}>
              <Text style={styles.value}>{customer.email}</Text>
              <Text style={styles.label}>البريد الإلكتروني</Text>
            </View>
          )}
          {deliveryAddress && (
            <View style={styles.row}>
              <Text style={styles.value}>{deliveryAddress}</Text>
              <Text style={styles.label}>عنوان التوصيل</Text>
            </View>
          )}
          {deliveryAddress && (
            <View style={styles.row}>
              <Text style={styles.value}>{order.note}</Text>
              <Text style={styles.label}>ملاحظات الطلب</Text>
            </View>
          )}
        </View>

        {/* Products */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>تفاصيل المنتجات</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.tableHeaderCell}>المجموع</Text>
              <Text style={styles.tableHeaderCell}>الكمية</Text>
              <Text style={styles.tableHeaderCell}>السعر</Text>
              <Text style={[styles.tableHeaderCell, { flex: 1.5 }]}>
                المنتج
              </Text>
            </View>
            {products.length === 0 ? (
              <View style={styles.tableRow}>
                <Text style={[styles.tableCell, { flex: 1 }]}>
                  لا توجد منتجات
                </Text>
              </View>
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
                  <View
                    key={p.id || i}
                    style={
                      i % 2 === 1
                        ? [styles.tableRow, styles.tableRowAlt]
                        : styles.tableRow
                    }
                  >
                    <Text style={styles.tableCell}>
                      {formatCurrency(lineTotal)}
                    </Text>
                    <Text style={styles.tableCell}>{qty}</Text>
                    <Text style={styles.tableCell}>
                      {formatCurrency(price)}
                    </Text>
                    <Text style={[styles.tableCell, { flex: 1.5 }]}>{title}</Text>
                  </View>
                );
              })
            )}
          </View>

          <View style={styles.totalsRow}>
            <Text style={styles.value}>{formatCurrency(subtotal)}</Text>
            <Text style={styles.label}>المجموع الفرعي</Text>
          </View>
          <View style={styles.totalsRow}>
            <Text style={styles.value}>{formatCurrency(DELIVERY_FEE)}</Text>
            <Text style={styles.label}>التوصيل</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalValue}>{formatCurrency(total)}</Text>
            <Text style={styles.totalLabel}>الإجمالي</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>شكراً لتعاملكم معنا</Text>
          <Text style={styles.footerText}>فاتورة إلكترونية — وثيقة معتمدة</Text>
          {store?.name && (
            <Text style={styles.footerText}>
              {new Date().getFullYear()} © {store.name}
            </Text>
          )}
        </View>
      </Page>
    </Document>
  );
};
