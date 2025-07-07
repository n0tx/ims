import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { PieChart as PieChartIcon, Circle } from "lucide-react";

interface CategorySalesChartProps {
  data: Array<{
    category: string;
    sales: number;
    revenue: number;
    percentage: number;
  }>;
  isLoading: boolean;
}

/**
 * Category Sales Chart Component
 * Supports toggling between pie and doughnut chart views
 * Shows sales distribution by product category
 */
export function CategorySalesChart({ data, isLoading }: CategorySalesChartProps) {
  const [chartType, setChartType] = useState<"pie" | "doughnut">("pie");

  // Color palette for chart segments
  const colors = [
    "hsl(207, 90%, 54%)",   // Primary blue
    "hsl(142, 71%, 45%)",   // Green
    "hsl(38, 100%, 50%)",   // Orange
    "hsl(271, 81%, 56%)",   // Purple
    "hsl(210, 40%, 40%)",   // Gray blue
  ];

  // Format data for chart
  const chartData = data.map((item, index) => ({
    name: item.category,
    value: item.revenue,
    percentage: item.percentage,
    color: colors[index % colors.length],
  }));

  // Custom tooltip
  const customTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900">{data.name}</p>
          <p className="text-primary">
            Revenue: ${data.value?.toLocaleString()}
          </p>
          <p className="text-gray-600">
            Share: {data.percentage}%
          </p>
        </div>
      );
    }
    return null;
  };

  // Custom label function
  const renderLabel = (entry: any) => {
    return `${entry.percentage}%`;
  };

  if (isLoading) {
    return (
      <Card className="p-6 border border-gray-100">
        <CardHeader>
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-36" />
            <Skeleton className="h-8 w-24" />
          </div>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="p-6 border border-gray-100">
      <CardHeader>
        <div className="flex items-center justify-between mb-6">
          <CardTitle className="text-lg font-semibold text-gray-900">Sales by Category</CardTitle>
          
          {/* Chart type toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <Button
              variant={chartType === "pie" ? "default" : "ghost"}
              size="sm"
              onClick={() => setChartType("pie")}
              className={`px-3 py-1 text-sm font-medium transition-colors ${
                chartType === "pie"
                  ? "text-white bg-primary"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <PieChartIcon className="mr-1 h-4 w-4" />
              Pie
            </Button>
            <Button
              variant={chartType === "doughnut" ? "default" : "ghost"}
              size="sm"
              onClick={() => setChartType("doughnut")}
              className={`px-3 py-1 text-sm font-medium transition-colors ${
                chartType === "doughnut"
                  ? "text-white bg-primary"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Circle className="mr-1 h-4 w-4" />
              Doughnut
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderLabel}
                outerRadius={chartType === "doughnut" ? 80 : 100}
                innerRadius={chartType === "doughnut" ? 40 : 0}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={customTooltip} />
              <Legend
                verticalAlign="bottom"
                height={36}
                iconType="circle"
                formatter={(value, entry) => (
                  <span className="text-sm text-gray-700">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
