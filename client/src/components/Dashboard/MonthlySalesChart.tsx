import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { BarChart3, TrendingUp } from "lucide-react";

interface MonthlySalesChartProps {
  data: Array<{
    month: string;
    sales: number;
    revenue: number;
  }>;
  isLoading: boolean;
}

/**
 * Monthly Sales Chart Component
 * Supports toggling between line and bar chart views
 * Displays sales and revenue data with responsive design
 */
export function MonthlySalesChart({ data, isLoading }: MonthlySalesChartProps) {
  const [chartType, setChartType] = useState<"line" | "bar">("line");

  // Format data for chart display
  const chartData = data.map((item) => ({
    month: new Date(item.month + "-01").toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
    sales: item.sales,
    revenue: item.revenue,
  }));

  // Custom tooltip formatter
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
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-32" />
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
          <CardTitle className="text-lg font-semibold text-gray-900">Monthly Sales</CardTitle>
          
          {/* Chart type toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <Button
              variant={chartType === "line" ? "default" : "ghost"}
              size="sm"
              onClick={() => setChartType("line")}
              className={`px-3 py-1 text-sm font-medium transition-colors ${
                chartType === "line"
                  ? "text-white bg-primary"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <TrendingUp className="mr-1 h-4 w-4" />
              Line
            </Button>
            <Button
              variant={chartType === "bar" ? "default" : "ghost"}
              size="sm"
              onClick={() => setChartType("bar")}
              className={`px-3 py-1 text-sm font-medium transition-colors ${
                chartType === "bar"
                  ? "text-white bg-primary"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <BarChart3 className="mr-1 h-4 w-4" />
              Bar
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === "line" ? (
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="month" 
                  stroke="#666"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#666"
                  fontSize={12}
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip content={customTooltip} />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="hsl(207, 90%, 54%)"
                  strokeWidth={3}
                  dot={{ fill: "hsl(207, 90%, 54%)", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: "hsl(207, 90%, 54%)", strokeWidth: 2 }}
                />
              </LineChart>
            ) : (
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="month" 
                  stroke="#666"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#666"
                  fontSize={12}
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip content={customTooltip} />
                <Bar
                  dataKey="revenue"
                  fill="hsl(207, 90%, 54%)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
