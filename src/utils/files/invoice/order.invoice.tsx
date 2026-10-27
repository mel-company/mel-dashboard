import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";
import CairoRegular from "../../../assets/fonts/Cairo-Regular.ttf";
import CairoBold from "../../../assets/fonts/Cairo-Bold.ttf";
import { formatCurrency } from "@/utils/format-currency";
import type { InvoiceStore, OrderInvoice } from "./order-invoice-model";

Font.register({
  family: "Cairo",
  fonts: [
    { src: CairoRegular, fontWeight: 400 },
    { src: CairoBold, fontWeight: 700 },
  ],
});

const INK = "#0f172a";
const BODY = "#334155";
const MUTED = "#64748b";
const FAINT = "#94a3b8";
const RULE = "#e2e8f0";

// RTL by hand: react-pdf has no `dir`, so rows run `row-reverse` and text
// aligns right, which puts the first child on the right as on the page.
const styles = StyleSheet.create({
  page: {
    paddingVertical: 40,
    paddingHorizontal: 44,
    fontFamily: "Cairo",
    fontSize: 10,
    color: BODY,
  },
  row: { flexDirection: "row-reverse", justifyContent: "space-between" },
  header: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: RULE,
  },
  storeName: { fontSize: 16, fontWeight: 700, color: INK, textAlign: "right" },
  storePhone: { fontSize: 10, color: MUTED, textAlign: "right" },
  title: { fontSize: 20, fontWeight: 700, color: INK, textAlign: "left" },
  meta: { fontSize: 10, color: MUTED, textAlign: "left" },
  metaStrong: { fontSize: 10, color: BODY, fontWeight: 700, textAlign: "left" },
  parties: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: RULE,
  },
  caption: { fontSize: 8, color: FAINT, textAlign: "right", marginBottom: 4 },
  strong: { fontSize: 11, fontWeight: 700, color: INK, textAlign: "right" },
  text: { fontSize: 10, color: BODY, textAlign: "right" },
  factRow: { flexDirection: "row-reverse", marginBottom: 3 },
  factLabel: { width: 70, fontSize: 9, color: FAINT, textAlign: "right" },
  factValue: { fontSize: 10, fontWeight: 700, color: BODY, textAlign: "right" },
  table: { marginTop: 18 },
  thead: {
    flexDirection: "row-reverse",
    backgroundColor: "#f1f5f9",
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  th: { fontSize: 8, fontWeight: 700, color: MUTED, textAlign: "right" },
  tr: {
    flexDirection: "row-reverse",
    paddingVertical: 7,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  td: { fontSize: 10, color: BODY, textAlign: "right" },
  colIndex: { width: 18 },
  colName: { flex: 1 },
  colQty: { width: 44, textAlign: "center" },
  colUnit: { width: 86 },
  colTotal: { width: 92 },
  variant: { fontSize: 8, color: MUTED, textAlign: "right" },
  struck: {
    fontSize: 8,
    color: FAINT,
    textDecoration: "line-through",
    textAlign: "right",
  },
  bottom: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    marginTop: 16,
  },
  totals: { width: 210 },
  totalRow: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    paddingVertical: 3,
  },
  grandRow: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    marginTop: 6,
    paddingTop: 8,
    borderTopWidth: 1.5,
    borderTopColor: INK,
  },
  grandLabel: { fontSize: 11, fontWeight: 700, color: INK },
  grandValue: { fontSize: 14, fontWeight: 700, color: INK },
  note: { flex: 1, marginLeft: 24 },
  footer: {
    position: "absolute",
    bottom: 28,
    left: 44,
    right: 44,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: RULE,
    fontSize: 8,
    color: FAINT,
    textAlign: "center",
  },
});

const money = (value: number) => formatCurrency(value);

export const OrderInvoicePDF = ({
  invoice,
  store,
}: {
  invoice: OrderInvoice;
  store?: InvoiceStore;
}) => {
  const pieces = invoice.lines.reduce((sum, l) => sum + l.quantity, 0);
  return (
    <Document title={`فاتورة ${invoice.code}`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.storeName}>{store?.name || "المتجر"}</Text>
            {store?.phone ? (
              <Text style={styles.storePhone}>{store.phone}</Text>
            ) : null}
          </View>
          <View>
            <Text style={styles.title}>فاتورة</Text>
            <Text style={styles.metaStrong}>{invoice.code}</Text>
            <Text style={styles.meta}>{invoice.date}</Text>
          </View>
        </View>

        <View style={styles.parties}>
          <View>
            <Text style={styles.caption}>إلى</Text>
            <Text style={styles.strong}>{invoice.customerName}</Text>
            {invoice.customerPhone ? (
              <Text style={styles.text}>{invoice.customerPhone}</Text>
            ) : null}
            {invoice.address ? (
              <Text style={styles.text}>{invoice.address}</Text>
            ) : null}
            {invoice.nearestPoint ? (
              <Text style={styles.text}>{invoice.nearestPoint}</Text>
            ) : null}
          </View>
          <View>
            <View style={styles.factRow}>
              <Text style={styles.factLabel}>حالة الطلب</Text>
              <Text style={styles.factValue}>{invoice.status}</Text>
            </View>
            {invoice.payment ? (
              <View style={styles.factRow}>
                <Text style={styles.factLabel}>طريقة الدفع</Text>
                <Text style={styles.factValue}>{invoice.payment}</Text>
              </View>
            ) : null}
            <View style={styles.factRow}>
              <Text style={styles.factLabel}>عدد القطع</Text>
              <Text style={styles.factValue}>{pieces}</Text>
            </View>
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.thead}>
            <Text style={[styles.th, styles.colIndex]}>#</Text>
            <Text style={[styles.th, styles.colName]}>المنتج</Text>
            <Text style={[styles.th, styles.colQty]}>الكمية</Text>
            <Text style={[styles.th, styles.colUnit]}>سعر الوحدة</Text>
            <Text style={[styles.th, styles.colTotal]}>المجموع</Text>
          </View>
          {invoice.lines.length === 0 ? (
            <View style={styles.tr}>
              <Text style={[styles.td, styles.colName]}>لا توجد منتجات</Text>
            </View>
          ) : (
            invoice.lines.map((line, index) => (
              <View key={line.key} style={styles.tr} wrap={false}>
                <Text style={[styles.td, styles.colIndex, { color: FAINT }]}>
                  {index + 1}
                </Text>
                <View style={styles.colName}>
                  <Text style={[styles.td, { fontWeight: 700, color: INK }]}>
                    {line.name}
                  </Text>
                  {line.variant ? (
                    <Text style={styles.variant}>{line.variant}</Text>
                  ) : null}
                </View>
                <Text style={[styles.td, styles.colQty]}>{line.quantity}</Text>
                <Text style={[styles.td, styles.colUnit]}>
                  {money(line.unitPrice)}
                </Text>
                <View style={styles.colTotal}>
                  <Text style={[styles.td, { fontWeight: 700, color: INK }]}>
                    {money(line.total)}
                  </Text>
                  {line.before != null ? (
                    <Text style={styles.struck}>{money(line.before)}</Text>
                  ) : null}
                </View>
              </View>
            ))
          )}
        </View>

        <View style={styles.bottom} wrap={false}>
          <View style={styles.note}>
            {invoice.note ? (
              <>
                <Text style={styles.caption}>ملاحظات</Text>
                <Text style={styles.text}>{invoice.note}</Text>
              </>
            ) : null}
          </View>
          <View style={styles.totals}>
            <View style={styles.totalRow}>
              <Text style={{ color: MUTED }}>المجموع الفرعي</Text>
              <Text>{money(invoice.subtotal)}</Text>
            </View>
            {invoice.productDiscount > 0 ? (
              <View style={styles.totalRow}>
                <Text style={{ color: MUTED }}>خصم المنتجات</Text>
                <Text>- {money(invoice.productDiscount)}</Text>
              </View>
            ) : null}
            {invoice.couponDiscount > 0 ? (
              <View style={styles.totalRow}>
                <Text style={{ color: MUTED }}>خصم الكوبون</Text>
                <Text>- {money(invoice.couponDiscount)}</Text>
              </View>
            ) : null}
            <View style={styles.totalRow}>
              <Text style={{ color: MUTED }}>التوصيل</Text>
              <Text>{money(invoice.delivery)}</Text>
            </View>
            <View style={styles.grandRow}>
              <Text style={styles.grandLabel}>الإجمالي</Text>
              <Text style={styles.grandValue}>{money(invoice.total)}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.footer} fixed>
          شكراً لتسوقكم{store?.name ? ` من ${store.name}` : ""}
        </Text>
      </Page>
    </Document>
  );
};
