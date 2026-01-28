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

Font.register({ family: "Cairo", fonts: [
  { src: CairoRegular, fontWeight: 400 },
  { src: CairoBold, fontWeight: 700 },
] });

export type StoreStats = {
  orders: number;
  products: number;
  categories: number;
  discounts: number;
  customers: number;
};

export type MonthlySale = {
  month: string;
  sales: number;
  orders: number;
};

export type OrderStatusStat = {
  status: string;
  count: number;
};

export type MostBoughtProduct = {
  name: string;
  count: number;
};

export type StatsReportData = {
  storeStats: StoreStats;
  monthlySales: MonthlySale[];
  ordersStatusStats: OrderStatusStat[];
  mostBoughtProducts: MostBoughtProduct[];
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
    marginBottom: 24,
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
  subtitle: {
    fontSize: 11,
    color: "#6b7280",
    textAlign: "center",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: "#1f2937",
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 8,
  },
  sectionTitleAccent: {
    width: 4,
    height: 20,
    backgroundColor: "#3b82f6",
    borderRadius: 2,
  },
  statsGrid: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 4,
  },
  statCard: {
    width: "31%",
    padding: 12,
    borderRadius: 6,
    marginBottom: 8,
  },
  statCardBlue: { backgroundColor: "#eff6ff" },
  statCardEmerald: { backgroundColor: "#ecfdf5" },
  statCardAmber: { backgroundColor: "#fffbeb" },
  statCardPurple: { backgroundColor: "#f5f3ff" },
  statCardRose: { backgroundColor: "#fff1f2" },
  statLabel: {
    fontSize: 10,
    color: "#6b7280",
    marginBottom: 4,
    textAlign: "right",
  },
  statValue: {
    fontSize: 18,
    fontWeight: 700,
    color: "#1f2937",
    textAlign: "right",
  },
  table: {
    marginTop: 8,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#1e40af",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderTopRightRadius: 6,
    borderTopLeftRadius: 6,
  },
  tableHeaderCell: {
    fontSize: 10,
    fontWeight: 700,
    color: "#ffffff",
    flex: 1,
    textAlign: "right",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  tableRowAlt: {
    backgroundColor: "#f9fafb",
  },
  tableCell: {
    fontSize: 10,
    color: "#374151",
    flex: 1,
    textAlign: "right",
  },
  tableCellBold: {
    fontWeight: 700,
  },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 36,
    right: 36,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    textAlign: "center",
  },
  footerText: {
    fontSize: 9,
    color: "#9ca3af",
  },
  pageNumber: {
    fontSize: 9,
    color: "#9ca3af",
    marginTop: 6,
  },
});

const formatCurrency = (value: number) => {
  return value?.toLocaleString() + " د.ع";
};

const statCardStyles = [
  styles.statCardBlue,
//   styles.statCardEmerald,
//   styles.statCardAmber,
//   styles.statCardPurple,
//   styles.statCardRose,
];

const summaryLabels: { key: keyof StoreStats; label: string }[] = [
  { key: "orders", label: "إجمالي الطلبات" },
  { key: "products", label: "المنتجات" },
  { key: "categories", label: "الفئات" },
  { key: "discounts", label: "الخصومات النشطة" },
  { key: "customers", label: "إجمالي المستخدمين" },
];

export const StatsReportPDF = ({ data }: { data: StatsReportData }) => {
  const { storeStats, monthlySales, ordersStatusStats, mostBoughtProducts } =
    data;
  const now = new Date();
  const dateStr = now.toLocaleDateString("ar-IQ");
  const timeStr = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
  const generatedAt = `${dateStr} ${timeStr}`;

  const defaultStats: StoreStats = {
    orders: 0,
    products: 0,
    categories: 0,
    discounts: 0,
    customers: 0,
  };
  const stats = { ...defaultStats, ...storeStats };

  return (
    <Document title="تقرير إحصائيات المتجر">
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>تقرير إحصائيات المتجر</Text>
          <Text style={styles.subtitle}>
            التاريخ: {generatedAt}
          </Text>
        </View>

        {/* Summary Section */}
        <View style={styles.section}>
          <View style={styles.sectionTitle}>
            <Text>ملخص المتجر</Text>
            <View style={styles.sectionTitleAccent} />
          </View>
          <View style={styles.statsGrid}>
            {summaryLabels.map((item, index) => (
              <View
                key={item.key}
                style={[styles.statCard, statCardStyles[index % statCardStyles.length]]}
              >
                <Text style={styles.statLabel}>{item.label}</Text>
                <Text style={styles.statValue}>{stats[item.key] ?? 0}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Monthly Sales Table */}
        <View style={styles.section}>
          <View style={styles.sectionTitle}>
            <Text>المبيعات الشهرية</Text>
            <View style={styles.sectionTitleAccent} />
          </View>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, { flex: 1.2 }]}>الشهر</Text>
              <Text style={styles.tableHeaderCell}>المبيعات (د.ع)</Text>
              <Text style={styles.tableHeaderCell}>عدد الطلبات</Text>
            </View>
            {            (monthlySales || []).length === 0 ? (
              <View style={styles.tableRow}>
                <Text style={[styles.tableCell, { flex: 1 }]}>لا توجد بيانات</Text>
              </View>
            ) : (
              (monthlySales || []).map((row, i) => (
                <View
                  key={row.month}
                  style={i % 2 === 1 ? [styles.tableRow, styles.tableRowAlt] : styles.tableRow}
                >
                  <Text style={[styles.tableCell, { flex: 1.2 }]}>{row.month}</Text>
                  <Text style={styles.tableCell}>
                    {formatCurrency(row.sales ?? 0)}
                  </Text>
                  <Text style={styles.tableCell}>{row.orders ?? 0}</Text>
                </View>
              ))
            )}
          </View>
        </View>

        {/* Order Status Table */}
        <View style={styles.section}>
          <View style={styles.sectionTitle}>
            <Text>حالة الطلبات</Text>
            <View style={styles.sectionTitleAccent} />
          </View>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, { flex: 1.5 }]}>الحالة</Text>
              <Text style={styles.tableHeaderCell}>العدد</Text>
            </View>
            {            (ordersStatusStats || []).length === 0 ? (
              <View style={styles.tableRow}>
                <Text style={[styles.tableCell, { flex: 1 }]}>لا توجد بيانات</Text>
              </View>
            ) : (
              (ordersStatusStats || []).map((row, i) => (
                <View
                  key={row.status}
                  style={i % 2 === 1 ? [styles.tableRow, styles.tableRowAlt] : styles.tableRow}
                >
                  <Text style={[styles.tableCell, { flex: 1.5 }]}>{row.status}</Text>
                  <Text style={[styles.tableCell, styles.tableCellBold]}>
                    {row.count ?? 0}
                  </Text>
                </View>
              ))
            )}
          </View>
        </View>

        {/* Most Bought Products Table */}
        <View style={styles.section}>
          <View style={styles.sectionTitle}>
            <Text>أكثر المنتجات مبيعاً</Text>
            <View style={styles.sectionTitleAccent} />
          </View>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, { flex: 2 }]}>المنتج</Text>
              <Text style={styles.tableHeaderCell}>عدد المشتريات</Text>
            </View>
            {            (mostBoughtProducts || []).length === 0 ? (
              <View style={styles.tableRow}>
                <Text style={[styles.tableCell, { flex: 1 }]}>لا توجد بيانات</Text>
              </View>
            ) : (
              (mostBoughtProducts || []).slice(0, 10).map((row, i) => (
                <View
                  key={`${row.name}-${i}`}
                  style={i % 2 === 1 ? [styles.tableRow, styles.tableRowAlt] : styles.tableRow}
                >
                  <Text style={[styles.tableCell, { flex: 2 }]}>{row.name}</Text>
                  <Text style={[styles.tableCell, styles.tableCellBold]}>
                    {row.count ?? 0}
                  </Text>
                </View>
              ))
            )}
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            تقرير إحصائيات المتجر — وثيقة إلكترونية
          </Text>
          <Text
            style={styles.pageNumber}
            render={({ pageNumber, totalPages }) =>
              `صفحة ${pageNumber} من ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  );
};
