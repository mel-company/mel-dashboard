import { useQuery } from "@tanstack/react-query";
import { statsAPI } from "../endpoints/stats.endpoints";

/**
 * Query key factory for stats
 */
export const statsKeys = {
  all: ["stats"] as const,
  store: () => [...statsKeys.all, "store"] as const,
  monthlySales: () => [...statsKeys.all, "monthly-sales"] as const,
  ordersStatus: () => [...statsKeys.all, "orders-status"] as const,
  mostBoughtProducts: () => [...statsKeys.all, "most-bought-products"] as const,
};

/**
 * Fetch store statistics
 */
export const useFetchStoreStats = (enabled: boolean = true) => {
  return useQuery<any>({
    queryKey: statsKeys.store(),
    queryFn: () => statsAPI.getStoreStats(),
    enabled,
  });
};

/**
 * Fetch monthly sales data
 */
export const useFetchMonthlySales = (enabled: boolean = true) => {
  return useQuery<any>({
    queryKey: statsKeys.monthlySales(),
    queryFn: () => statsAPI.getMonthlySales(),
    enabled,
  });
};

/**
 * Fetch order status statistics
 */
export const useFetchOrdersStatusStats = (enabled: boolean = true) => {
  return useQuery<any>({
    queryKey: statsKeys.ordersStatus(),
    queryFn: () => statsAPI.getOrdersStatusStats(),
    enabled,
  });
};

/**
 * Fetch most bought products
 */
export const useFetchMostBoughtProducts = (enabled: boolean = true) => {
  return useQuery<any>({
    queryKey: statsKeys.mostBoughtProducts(),
    queryFn: () => statsAPI.getMostBoughtProducts(),
    enabled,
  });
};

