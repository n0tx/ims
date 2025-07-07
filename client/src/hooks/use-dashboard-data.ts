import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

/**
 * Custom hook for managing dashboard data fetching and state
 * Provides loading states, error handling, and data refetching capabilities
 */
export function useDashboardData(dateFilter: number = 30) {
  // Dashboard metrics query
  const {
    data: metricsData,
    isLoading: metricsLoading,
    error: metricsError,
    refetch: refetchMetrics
  } = useQuery({
    queryKey: ['/api/reports/dashboard'],
    queryFn: () => api.reports.getDashboardMetrics(),
  });

  // Monthly sales data query
  const {
    data: monthlySalesData,
    isLoading: monthlySalesLoading,
    error: monthlySalesError,
    refetch: refetchMonthlySales
  } = useQuery({
    queryKey: ['/api/reports/monthly-sales', dateFilter],
    queryFn: () => api.reports.getMonthlySalesData(Math.ceil(dateFilter / 30)),
  });

  // Category sales data query
  const {
    data: categorySalesData,
    isLoading: categorySalesLoading,
    error: categorySalesError,
    refetch: refetchCategorySales
  } = useQuery({
    queryKey: ['/api/reports/category-sales'],
    queryFn: () => api.reports.getCategorySalesData(),
  });

  // Top products data query
  const {
    data: topProductsData,
    isLoading: topProductsLoading,
    error: topProductsError,
    refetch: refetchTopProducts
  } = useQuery({
    queryKey: ['/api/reports/top-selling'],
    queryFn: () => api.reports.getTopSellingProducts(10),
  });

  // Low stock products query
  const {
    data: lowStockData,
    isLoading: lowStockLoading,
    error: lowStockError,
    refetch: refetchLowStock
  } = useQuery({
    queryKey: ['/api/reports/low-stock'],
    queryFn: () => api.reports.getLowStockProducts(),
  });

  // Combined loading state
  const isLoading = metricsLoading || monthlySalesLoading || categorySalesLoading || topProductsLoading || lowStockLoading;

  // Combined error state
  const hasError = !!(metricsError || monthlySalesError || categorySalesError || topProductsError || lowStockError);

  // Refetch all data
  const refetchAll = () => {
    refetchMetrics();
    refetchMonthlySales();
    refetchCategorySales();
    refetchTopProducts();
    refetchLowStock();
  };

  return {
    // Data
    metrics: metricsData?.data,
    monthlySales: monthlySalesData?.data || [],
    categorySales: categorySalesData?.data || [],
    topProducts: topProductsData?.data || [],
    lowStockProducts: lowStockData?.data || [],
    
    // Loading states
    isLoading,
    metricsLoading,
    monthlySalesLoading,
    categorySalesLoading,
    topProductsLoading,
    lowStockLoading,
    
    // Error states
    hasError,
    metricsError,
    monthlySalesError,
    categorySalesError,
    topProductsError,
    lowStockError,
    
    // Refetch functions
    refetchAll,
    refetchMetrics,
    refetchMonthlySales,
    refetchCategorySales,
    refetchTopProducts,
    refetchLowStock,
  };
}

/**
 * Hook for handling date filter changes across the dashboard
 */
export function useDateFilter() {
  const [dateFilter, setDateFilter] = useState(30);
  
  const handleDateFilterChange = (days: number) => {
    setDateFilter(days);
  };

  return {
    dateFilter,
    setDateFilter: handleDateFilterChange,
  };
}

// Missing import
import { useState } from 'react';
