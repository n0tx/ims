import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Table, BarChart3, ArrowUpDown } from "lucide-react";

interface TopProductsTableProps {
  data: Array<{
    rank: number;
    productId: string;
    name: string;
    category: string;
    revenue: number;
    quantitySold: number;
    sku: string;
  }>;
  isLoading: boolean;
}

type SortField = "rank" | "name" | "category" | "revenue" | "quantitySold";
type SortDirection = "asc" | "desc";

/**
 * Top Products Table Component
 * Supports both table and horizontal bar chart views
 * Includes sortable columns and responsive design
 */
export function TopProductsTable({ data, isLoading }: TopProductsTableProps) {
  const [viewType, setViewType] = useState<"table" | "chart">("table");
  const [sortField, setSortField] = useState<SortField>("rank");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  // Sort data based on current sort field and direction
  const sortedData = [...data].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];
    
    if (typeof aValue === "string") {
      aValue = aValue.toLowerCase();
      bValue = (bValue as string).toLowerCase();
    }
    
    if (sortDirection === "asc") {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });

  // Handle sort column click
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Get rank badge color
  const getRankBadgeColor = (rank: number) => {
    if (rank === 1) return "bg-primary text-white";
    if (rank === 2) return "bg-gray-600 text-white";
    if (rank === 3) return "bg-amber-600 text-white";
    return "bg-gray-400 text-white";
  };

  // Get category badge variant
  const getCategoryBadge = (category: string) => {
    const colorMap: Record<string, string> = {
      Electronics: "bg-blue-100 text-blue-800",
      Audio: "bg-purple-100 text-purple-800",
      Furniture: "bg-green-100 text-green-800",
      "Food & Beverage": "bg-yellow-100 text-yellow-800",
      Fitness: "bg-red-100 text-red-800",
      Lifestyle: "bg-indigo-100 text-indigo-800",
    };
    return colorMap[category] || "bg-gray-100 text-gray-800";
  };

  // Format chart data for horizontal bar chart
  const chartData = data.slice(0, 10).map((item) => ({
    name: item.name.length > 20 ? item.name.substring(0, 20) + "..." : item.name,
    revenue: item.revenue,
  }));

  // Custom chart tooltip
  const customTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900">{label}</p>
          <p className="text-primary">
            Revenue: ${payload[0].value?.toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <Card className="p-6 border border-gray-100">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <Skeleton className="h-6 w-48 mb-4 sm:mb-0" />
            <Skeleton className="h-8 w-24" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-6 w-6 rounded-full" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-12" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="p-6 border border-gray-100">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <CardTitle className="text-lg font-semibold text-gray-900 mb-4 sm:mb-0">
            Top 10 Best-Selling Products
          </CardTitle>
          
          {/* View type toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <Button
              variant={viewType === "table" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewType("table")}
              className={`px-3 py-1 text-sm font-medium transition-colors ${
                viewType === "table"
                  ? "text-white bg-primary"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Table className="mr-1 h-4 w-4" />
              Table
            </Button>
            <Button
              variant={viewType === "chart" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewType("chart")}
              className={`px-3 py-1 text-sm font-medium transition-colors ${
                viewType === "chart"
                  ? "text-white bg-primary"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <BarChart3 className="mr-1 h-4 w-4" />
              Chart
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {viewType === "table" ? (
          /* Table View */
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  {[
                    { key: "rank", label: "Rank" },
                    { key: "name", label: "Product" },
                    { key: "category", label: "Category" },
                    { key: "revenue", label: "Revenue" },
                    { key: "quantitySold", label: "Qty Sold" },
                  ].map((column) => (
                    <th
                      key={column.key}
                      className="text-left py-3 px-4 font-semibold text-gray-900 cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => handleSort(column.key as SortField)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handleSort(column.key as SortField);
                        }
                      }}
                      aria-label={`Sort by ${column.label}`}
                    >
                      {column.label}
                      <ArrowUpDown className="inline ml-1 h-4 w-4 text-gray-400" />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedData.slice(0, 10).map((product) => (
                  <tr key={product.productId} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4">
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${getRankBadgeColor(
                          product.rank
                        )}`}
                      >
                        {product.rank}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900">{product.name}</div>
                      <div className="text-sm text-gray-500">SKU: {product.sku}</div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge className={`${getCategoryBadge(product.category)} text-xs font-medium`}>
                        {product.category}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 font-semibold text-gray-900">
                      ${product.revenue.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-gray-600">{product.quantitySold.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* Chart View */
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                layout="horizontal"
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  type="number" 
                  stroke="#666"
                  fontSize={12}
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  stroke="#666"
                  fontSize={12}
                  width={120}
                />
                <Tooltip content={customTooltip} />
                <Bar
                  dataKey="revenue"
                  fill="hsl(207, 90%, 54%)"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
