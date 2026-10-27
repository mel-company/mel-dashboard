import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import { formatNumber } from "@/utils/format-currency";
import type { Style } from "@react-pdf/types";
import type { InvoiceStore, OrderInvoice } from "./order-invoice-model";

// Same face as the dashboard and the invoice preview page (src/index.css).
const DIATYPE = "/fonts/ABCDIATYPEARABIC/ABCDIATYPEARABIC";
Font.register({
  family: "Diatype",
  fonts: [
    { src: `${DIATYPE}-REGULAR-TRIAL.OTF`, fontWeight: 400 },
    { src: `${DIATYPE}-BOLD-TRIAL.OTF`, fontWeight: 700 },
  ],
});

const INK = "#0f172a";
const BODY = "#334155";
const MUTED = "#64748b";
const FAINT = "#94a3b8";
const RULE = "#e2e8f0";

/**
 * The characters ABC Diatype Arabic has glyphs for. fontkit throws while
 * embedding the font if any other one (an emoji in a product name, say) is
 * drawn, and the whole download fails.
 */
const UNSUPPORTED =
  /[^\n\u0020-\u007E\u00A0-\u00AC\u00AE-\u017E\u060C\u061B\u061F\u0621-\u063A\u0640-\u0656\u0660-\u0671\u0679\u067E\u0686\u0688\u0691\u0695\u0698\u06A1\u06A4\u06A9\u06AF\u06B5\u06BA\u06BE\u06C1-\u06C3\u06C6\u06CC\u06CE\u06D2-\u06D5\u06F0-\u06F9\u2013\u2014\u2018\u2019\u201C\u201D\u2022\u2026]/g;

/**
 * Text the merchant or customer typed. The trailing space works around a
 * react-pdf bug that repeats the last Arabic letters of a right-to-left line
 * ending in Latin ("قميص قطني 100% Cotton" came out "قطنيني").
 */
const typed = (text: string) => `${text.replace(UNSUPPORTED, "").trim()} `;

// RTL by hand: react-pdf has no `dir`, so rows run `row-reverse` and text
// aligns right, which puts the first child on the right as on the page.
// Text the merchant or customer typed also sets `direction: "rtl"` (it is
// not inherited) so mixed text like "قميص 100% Cotton" keeps its order.
const styles = StyleSheet.create({
  page: {
    paddingVertical: 40,
    paddingHorizontal: 44,
    fontFamily: "Diatype",
    fontSize: 10,
    color: BODY,
  },
  row: { flexDirection: "row-reverse", justifyContent: "space-between" },
  money: { flexDirection: "row", alignItems: "baseline" },
  currency: { marginLeft: 3 },
  brand: { flexDirection: "row-reverse", alignItems: "center" },
  logo: { width: 48, height: 48, marginLeft: 10, objectFit: "contain" },
  header: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: RULE,
  },
  storeName: {
    direction: "rtl",
    fontSize: 16,
    fontWeight: 700,
    color: INK,
    textAlign: "right",
  },
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
  strong: {
    lineHeight: 1.6,
    direction: "rtl",
    fontSize: 11,
    fontWeight: 700,
    color: INK,
    textAlign: "right",
  },
  text: {
    lineHeight: 1.6,
    direction: "rtl",
    fontSize: 10,
    color: BODY,
    textAlign: "right",
  },
  factRow: { flexDirection: "row-reverse", marginBottom: 3 },
  factLabel: {
    lineHeight: 1.6,
    width: 70,
    fontSize: 9,
    color: FAINT,
    textAlign: "right",
  },
  factValue: {
    lineHeight: 1.6,
    direction: "rtl",
    fontSize: 10,
    fontWeight: 700,
    color: BODY,
    textAlign: "right",
  },
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
  td: { direction: "rtl", fontSize: 10, color: BODY, textAlign: "right" },
  colIndex: { width: 18 },
  colName: { flex: 1 },
  colQty: { width: 44, textAlign: "center" },
  colUnit: { width: 86 },
  // A right-aligned cell holding a row: the row hugs the cell's right edge.
  cellEnd: { alignItems: "flex-end" },
  colTotal: { width: 92 },
  variant: { direction: "rtl", fontSize: 8, color: MUTED, textAlign: "right" },
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
    direction: "rtl",
  },
});

/**
 * An amount as the dashboard shows it: the figure, then «د.ع», read left to
 * right. As one string react-pdf runs it through the bidi algorithm and the
 * currency flips to the figure's left on some lines and not others, so the
 * two halves are separate runs in a left-to-right row.
 */
const Money = ({
  value,
  negative,
  style,
}: {
  value: number;
  negative?: boolean;
  style?: Style;
}) => (
  <View style={styles.money}>
    <Text style={style}>
      {negative ? "-" : ""}
      {formatNumber(value)}
    </Text>
    <Text style={[style ?? {}, styles.currency]}>د.ع</Text>
  </View>
);

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
          <View style={styles.brand}>
            {store?.logo ? (
              <Image src={store.logo} style={styles.logo} />
            ) : null}
            <View style={styles.cellEnd}>
              <Text style={styles.storeName}>
                {typed(store?.name || "المتجر")}
              </Text>
              {store?.phone ? (
                <Text style={styles.storePhone}>{typed(store.phone)}</Text>
              ) : null}
            </View>
          </View>
          <View>
            <Text style={styles.title}>فاتورة</Text>
            <Text style={styles.metaStrong}>{invoice.code}</Text>
            <Text style={styles.meta}>{invoice.date}</Text>
          </View>
        </View>

        <View style={styles.parties}>
          <View style={styles.cellEnd}>
            <Text style={styles.caption}>إلى</Text>
            <Text style={styles.strong}>{typed(invoice.customerName)}</Text>
            {invoice.customerPhone ? (
              <Text style={styles.text}>{typed(invoice.customerPhone)}</Text>
            ) : null}
            {invoice.address ? (
              <Text style={styles.text}>{typed(invoice.address)}</Text>
            ) : null}
            {invoice.nearestPoint ? (
              <Text style={styles.text}>{typed(invoice.nearestPoint)}</Text>
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
                    {typed(line.name)}
                  </Text>
                  {line.variant ? (
                    <Text style={styles.variant}>{typed(line.variant)}</Text>
                  ) : null}
                </View>
                <Text style={[styles.td, styles.colQty]}>{line.quantity}</Text>
                <View style={[styles.colUnit, styles.cellEnd]}>
                  <Money value={line.unitPrice} style={styles.td} />
                </View>
                <View style={[styles.colTotal, styles.cellEnd]}>
                  <Money
                    value={line.total}
                    style={{ ...styles.td, fontWeight: 700, color: INK }}
                  />
                  {line.before != null ? (
                    <Money value={line.before} style={styles.struck} />
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
                <Text style={styles.text}>{typed(invoice.note)}</Text>
              </>
            ) : null}
          </View>
          <View style={styles.totals}>
            <View style={styles.totalRow}>
              <Text style={{ color: MUTED }}>المجموع الفرعي</Text>
              <Money value={invoice.subtotal} />
            </View>
            {invoice.productDiscount > 0 ? (
              <View style={styles.totalRow}>
                <Text style={{ color: MUTED }}>خصم المنتجات</Text>
                <Money value={invoice.productDiscount} negative />
              </View>
            ) : null}
            {invoice.couponDiscount > 0 ? (
              <View style={styles.totalRow}>
                <Text style={{ color: MUTED }}>خصم الكوبون</Text>
                <Money value={invoice.couponDiscount} negative />
              </View>
            ) : null}
            <View style={styles.totalRow}>
              <Text style={{ color: MUTED }}>التوصيل</Text>
              <Money value={invoice.delivery} />
            </View>
            <View style={styles.grandRow}>
              <Text style={styles.grandLabel}>الإجمالي</Text>
              <Money value={invoice.total} style={styles.grandValue} />
            </View>
          </View>
        </View>

        <Text style={styles.footer} fixed>
          {typed(`شكراً لتسوقكم${store?.name ? ` من ${store.name}` : ""}`)}
        </Text>
      </Page>
    </Document>
  );
};
