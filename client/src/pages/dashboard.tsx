import { useState } from "react";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { MainLayout } from "@/components/Layout/MainLayout";
import { MetricsCards } from "@/components/Dashboard/MetricsCards";
import { MonthlySalesChart } from "@/components/Dashboard/MonthlySalesChart";
import { CategorySalesChart } from "@/components/Dashboard/CategorySalesChart";
import { TopProductsTable } from "@/components/Dashboard/TopProductsTable";

/**
 * Main Dashboard Component
 * Implements the complete inventory management dashboard with responsive design
 * Includes metrics cards, charts, and real-time data updates
 */
export default function Dashboard() {
  const [dateFilter, setDateFilter] = useState(30);
  
  // Fetch all dashboard data with loading and error states
  const {
    metrics,
    monthlySales,
    categorySales,
    topProducts,
    lowStockProducts,
    isLoading,
    hasError,
    refetchAll
  } = useDashboardData(dateFilter);

  /**
   * Handle date filter changes - updates all charts in real-time
   */
  const handleDateFilterChange = (days: number) => {
    setDateFilter(days);
    // Data will automatically refetch due to query key dependency
  };

  /**
   * Handle low stock navigation
   */
  const handleLowStockClick = () => {
    // In a real app, this would navigate to products page with low stock filter
    console.log('Navigate to low stock products');
  };

  // Show loading overlay during initial data fetch
  if (isLoading && !metrics) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-lg p-6 flex items-center space-x-3 shadow-lg">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          <span className="text-gray-700 font-medium">Loading dashboard data...</span>
        </div>
      </div>
    );
  }

  // Show error state
  if (hasError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-lg p-6 text-center shadow-lg max-w-md mx-4">
          <div className="text-red-500 mb-4">
            <i className="fas fa-exclamation-triangle text-4xl"></i>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600 mb-4">
            Unable to connect to the backend API. Please ensure the backend server is running on port 8000.
          </p>
          <button
            onClick={refetchAll}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <MainLayout 
      title="Dashboard"
      subtitle="Comprehensive inventory management overview"
      dateFilter={dateFilter}
      onDateFilterChange={handleDateFilterChange}
    >
      {/* Metrics cards */}
      <MetricsCards
        metrics={metrics}
        lowStockCount={lowStockProducts?.length || 0}
        onLowStockClick={handleLowStockClick}
        isLoading={isLoading}
      />

      {/* Charts grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
        <MonthlySalesChart
          data={monthlySales}
          isLoading={isLoading}
        />
        <CategorySalesChart
          data={categorySales}
          isLoading={isLoading}
        />
      </div>

      {/* Top products section */}
      <TopProductsTable
        data={topProducts}
        isLoading={isLoading}
      />
    </MainLayout>
  );
}