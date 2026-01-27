import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import Almarai from "../../assets/fonts/Almarai-Regular.ttf";
import { formatDate } from "../helpers";

Font.register({ family: "Almarai", src: Almarai });

type InvoiceTypeEnum = "DELIVERY_FEES" | "REGISTRATION_FORM_FEES" | "OTHER";

const InvoiceType: Record<InvoiceTypeEnum, string> = {
  "DELIVERY_FEES": "رسوم التوصيل",
  "REGISTRATION_FORM_FEES": "رسوم استمارة التسجيل",
  "OTHER": "أخرى",
};

const styles = StyleSheet.create({
  page: {
    padding: 40,
    direction: "rtl",
    fontFamily: "Almarai",
    backgroundColor: "#ffffff",
  },
  header: {
    marginBottom: 10,
    borderBottom: "1 solid #e5e7eb",
    paddingBottom: 10,
  },
  storeName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 10,
    textAlign: "right",
  },
  storeInfo: {
    fontSize: 11,
    color: "#6b7280",
    textAlign: "right",
    lineHeight: 1.6,
  },
  invoiceTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1e40af",
    textAlign: "center",
    marginBottom: 30,
    marginTop: 20,
  },
  section: {
    marginBottom: 20,
    textAlign: "right",
    direction: "rtl",
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 12,
    paddingBottom: 8,
    borderBottom: "1 solid #e5e7eb",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    paddingVertical: 6,
  },
  label: {
    fontSize: 11,
    color: "#6b7280",
    fontWeight: "medium",
    width: "40%",
  },
  value: {
    fontSize: 11,
    color: "#1f2937",
    fontWeight: "bold",
    width: "60%",
    textAlign: "right",
  },
  amountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#f9fafb",
    borderRadius: 4,
  },
  amountLabel: {
    fontSize: 12,
    color: "#374151",
    fontWeight: "medium",
  },
  amountValue: {
    fontSize: 13,
    color: "#1f2937",
    fontWeight: "bold",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
    paddingTop: 15,
    paddingBottom: 15,
    paddingHorizontal: 15,
    backgroundColor: "#1e40af",
    borderRadius: 4,
    borderTop: "2 solid #1e3a8a",
  },
  totalLabel: {
    fontSize: 14,
    color: "#ffffff",
    fontWeight: "bold",
  },
  totalValue: {
    fontSize: 16,
    color: "#ffffff",
    fontWeight: "bold",
  },
  footer: {
    marginTop: 40,
    paddingTop: 20,
    borderTop: "1 solid #e5e7eb",
    textAlign: "center",
  },
  footerText: {
    fontSize: 10,
    color: "#9ca3af",
    lineHeight: 1.5,
  },
  infoBox: {
    backgroundColor: "#f3f4f6",
    padding: 15,
    borderRadius: 4,
    marginBottom: 15,
    textAlign: "right",
    direction: "rtl",
  },
  infoText: {
    fontSize: 10,
    color: "#4b5563",
    lineHeight: 1.6,
    textAlign: "right",
    direction: "rtl",
  },
  twoColumn: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  column: {
    width: "48%",
  },
});

const formatCurrency = (amount: number) => {
  return amount?.toLocaleString() + " د.ع";
};

export const InvoicePDF = ({
  invoice,
  store,
}: {
  invoice: any;
  store?: any;
}) => {
  const remainingAmount = (invoice.due_price || 0) - (invoice.paid_price || 0);
  const invoiceTypeText =
    InvoiceType[invoice.type as InvoiceTypeEnum] ||
    invoice.description ||
    "فاتورة";

  return (
    <Document title="فاتورة">
      <Page size="A4" style={styles.page}>
        {/* Header - Store Information */}
        <View style={styles.header}>
          {store?.name && <Text style={styles.storeName}>{store.name}</Text>}
          {store?.address && (
            <Text style={styles.storeInfo}>{store.address}</Text>
          )}
          {store?.phone && (
            <Text style={styles.storeInfo}>هاتف: {store.phone}</Text>
          )}
          {store?.email && (
            <Text style={styles.storeInfo}>البريد الإلكتروني: {store.email}</Text>
          )}
        </View>

        {/* Invoice Title */}
        {/* <Text style={styles.invoiceTitle}>فاتورة</Text> */}

        {/* Invoice Number Section */}
        <View style={styles.section}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              backgroundColor: "#eff6ff",
              padding: 15,
              borderRadius: 4,
              marginBottom: 10,
            }}
          >
            <Text
              style={{ fontSize: 24, fontWeight: "bold", color: "#1e40af" }}
            >
              {invoice.invoice_number || "غير متاح"}
            </Text>
            <Text
              style={{ fontSize: 12, color: "#1e40af", fontWeight: "bold" }}
            >
              رقم الفاتورة
            </Text>
          </View>
        </View>

        {/* Invoice Details Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>تفاصيل الفاتورة</Text>

          <View style={styles.twoColumn}>
            <View style={styles.column}>
              <View style={styles.row}>
                <Text style={styles.value}>{invoiceTypeText}</Text>
                <Text style={styles.label}>نوع الفاتورة</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.value}>
                  {formatDate(invoice.issued_at)?.date}
                </Text>
                <Text style={styles.label}>تاريخ الإصدار</Text>
              </View>
            </View>
            <View style={styles.column}>
              <View style={styles.row}>
                <Text style={styles.value}>
                  {invoice.paid_at
                    ? formatDate(invoice.paid_at)?.date
                    : "غير مدفوع"}
                </Text>
                <Text style={styles.label}>تاريخ الدفع</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.value}>
                  {formatDate(invoice.due_date)?.date}
                </Text>
                <Text style={styles.label}>تاريخ الاستحقاق</Text>
              </View>
            </View>
          </View>

          {invoice.description && (
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                <Text style={{ fontWeight: "bold" }}>الوصف: </Text>
                {invoice.description}
              </Text>
            </View>
          )}
        </View>

        {/* user Information */}
        {invoice.user && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>معلومات المستخدم</Text>
            <View style={styles.row}>
              <Text style={styles.value}>
                {invoice.user.name || "غير محدد"}
              </Text>
              <Text style={styles.label}>اسم المستخدم</Text>
            </View>
          </View>
        )}

        {/* Payment Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>تفاصيل الدفع</Text>

          <View style={styles.amountRow}>
            <Text style={styles.amountValue}>
              {formatCurrency(invoice.due_price || 0)}
            </Text>
            <Text style={styles.amountLabel}>المبلغ الإجمالي</Text>
          </View>

          <View style={styles.amountRow}>
            <Text style={[styles.amountValue, { color: "#059669" }]}>
              {formatCurrency(invoice.paid_price || 0)}
            </Text>
            <Text style={styles.amountLabel}>المبلغ المدفوع</Text>
          </View>

          <View style={styles.amountRow}>
            <Text
              style={[
                styles.amountValue,
                { color: remainingAmount > 0 ? "#dc2626" : "#059669" },
              ]}
            >
              {formatCurrency(remainingAmount)}
            </Text>
            <Text style={styles.amountLabel}>المبلغ المتبقي</Text>
          </View>

          {/* Total Paid Row */}
          {/* <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>
              المبلغ المدفوع في هذه الفاتورة:
            </Text>
            <Text style={styles.totalValue}>
              {formatCurrency(invoice.paid_price || 0)}
            </Text>
          </View> */}
        </View>

        {/* Received By Information */}
        {invoice.user && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>معلومات الاستلام</Text>
            <View style={styles.row}>
              <Text style={styles.value}>
                {invoice.user.name || "غير محدد"}
              </Text>
              <Text style={styles.label}>المستلم</Text>
            </View>
            {invoice.user?.phone && (
              <View style={styles.row}>
                <Text style={styles.value}>{invoice.user.phone}</Text>
                <Text style={styles.label}>رقم الهاتف</Text>
              </View>
            )}
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>شكراً لتعاملكم معنا</Text>
          <Text style={styles.footerText}>هذه وثيقة إلكترونية معتمدة</Text>
          {store?.name && (
            <Text style={styles.footerText}>
              {new Date().getFullYear()} {store.name}.
            </Text>
          )}
        </View>
      </Page>
    </Document>
  );
};