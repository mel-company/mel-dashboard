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
  ACTIVE: "نشط",
  INACTIVE: "متوقف",
  PAUSED: "متوقف",
  CANCELLED: "ملغي",
  EXPIRED: "منتهي",
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
    marginBottom: 22,
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
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 700,
    color: "#1f2937",
    marginBottom: 10,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    paddingVertical: 4,
  },
  label: {
    fontSize: 10,
    color: "#6b7280",
    width: "38%",
    textAlign: "right",
  },
  value: {
    fontSize: 11,
    color: "#1f2937",
    fontWeight: 700,
    width: "62%",
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
  statusActive: { backgroundColor: "#d1fae5" },
  statusInactive: { backgroundColor: "#fef3c7" },
  statusCancelled: { backgroundColor: "#fee2e2" },
  statusExpired: { backgroundColor: "#f3f4f6" },
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
  planCard: {
    backgroundColor: "#eff6ff",
    padding: 14,
    borderRadius: 6,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#bfdbfe",
  },
  planName: {
    fontSize: 16,
    fontWeight: 700,
    color: "#1e40af",
    marginBottom: 6,
    textAlign: "right",
  },
  planDescription: {
    fontSize: 10,
    color: "#374151",
    lineHeight: 1.5,
    textAlign: "right",
  },
  priceRow: {
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
    marginTop: 14,
    paddingTop: 14,
    paddingBottom: 14,
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
  featureItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 6,
    gap: 6,
  },
  featureBullet: {
    fontSize: 10,
    color: "#059669",
    width: 14,
    textAlign: "right",
  },
  featureText: {
    fontSize: 10,
    color: "#374151",
    flex: 1,
    textAlign: "right",
  },
  footer: {
    marginTop: 24,
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
  if (s === "ACTIVE") return styles.statusActive;
  if (s === "INACTIVE" || s === "PAUSED") return styles.statusInactive;
  if (s === "CANCELLED") return styles.statusCancelled;
  if (s === "EXPIRED") return styles.statusExpired;
  return styles.statusActive;
};

export type SubscriptionInvoiceData = {
  id: string;
  status?: string;
  start_at?: string;
  end_at?: string;
  planId?: string;
  store?: { id?: string; name?: string };
  plan?: {
    id?: string;
    name?: string;
    description?: string | null;
    monthly_price?: number;
    yearly_price?: number;
    features?: Array<{
      id?: string;
      name?: string;
      description?: string | null;
    }>;
    modules?: Array<{ id?: string; name?: string }>;
  };
};

export const SubscriptionInvoicePDF = ({
  subscription,
  store,
}: {
  subscription: SubscriptionInvoiceData;
  store?: { name?: string; address?: string; phone?: string; email?: string };
}) => {
  const plan = subscription.plan;
  const statusLabel =
    STATUS_LABELS[(subscription.status || "").toUpperCase()] ||
    subscription.status ||
    "—";
  const statusStyle = getStatusStyle(subscription.status || "");
  const storeName = subscription.store?.name || store?.name || "—";
  const startDate = subscription.start_at
    ? formatDate(subscription.start_at)?.date || subscription.start_at
    : "—";
  const endDate = subscription.end_at
    ? formatDate(subscription.end_at)?.date || subscription.end_at
    : "—";

  return (
    <Document title={`فاتورة اشتراك #${String(subscription.id).slice(0, 8)}`}>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          {storeName && (
            <Text
              style={{
                fontSize: 12,
                color: "#6b7280",
                textAlign: "right",
                marginBottom: 4,
              }}
            >
              {storeName}
            </Text>
          )}
          <Text style={styles.title}>فاتورة الاشتراك</Text>
          <Text style={styles.subtitle}>
            رقم الاشتراك: #{String(subscription.id).slice(0, 8)}
          </Text>
        </View>

        {/* Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>حالة الاشتراك</Text>
          <View style={styles.row}>
            <View style={[styles.statusBadge, statusStyle]}>
              <Text style={styles.statusBadgeText}>{statusLabel}</Text>
            </View>
            <Text style={styles.label}>الحالة</Text>
          </View>
        </View>

        {/* Dates */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>الفترة</Text>
          <View style={styles.row}>
            <Text style={styles.value}>{endDate}</Text>
            <Text style={styles.label}>تاريخ الانتهاء</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.value}>{startDate}</Text>
            <Text style={styles.label}>تاريخ البدء</Text>
          </View>
        </View>

        {/* Plan */}
        {plan && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>الخطة</Text>
            <View style={styles.planCard}>
              <Text style={styles.planName}>{plan.name || "—"}</Text>
              {plan.description && (
                <Text style={styles.planDescription}>{plan.description}</Text>
              )}
            </View>

            {/* Pricing */}
            <View style={styles.priceRow}>
              <Text style={styles.value}>
                {formatCurrency(plan.yearly_price ?? 0)}
              </Text>
              <Text style={styles.label}>السعر السنوي</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.value}>
                {formatCurrency(plan.monthly_price ?? 0)}
              </Text>
              <Text style={styles.label}>السعر الشهري</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalValue}>
                {formatCurrency(plan.monthly_price ?? 0)}
              </Text>
              <Text style={styles.totalLabel}>المبلغ (شهري)</Text>
            </View>
          </View>
        )}

        {/* Features */}
        {plan?.features && plan.features.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>المميزات</Text>
            {plan.features.slice(0, 12).map((f: any, i: number) => (
              <View key={f.id || i} style={styles.featureItem}>
                <Text style={styles.featureText}>{f.feature?.name || "—"}</Text>
                <Text style={styles.featureBullet}>✓</Text>
              </View>
            ))}
            {plan.features.length > 12 && (
              <Text style={[styles.featureText, { marginTop: 4 }]}>
                +{plan.features.length - 12} ميزة أخرى
              </Text>
            )}
          </View>
        )}

        {/* Modules */}
        {plan?.modules && plan.modules.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>الوحدات</Text>
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                {plan.modules
                  .map((m) => m.name)
                  .filter(Boolean)
                  .join(" — ")}
              </Text>
            </View>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>شكراً لاشتراككم معنا</Text>
          <Text style={styles.footerText}>
            فاتورة اشتراك إلكترونية — وثيقة معتمدة
          </Text>
          {storeName && (
            <Text style={styles.footerText}>
              {new Date().getFullYear()} © {storeName}
            </Text>
          )}
        </View>
      </Page>
    </Document>
  );
};
