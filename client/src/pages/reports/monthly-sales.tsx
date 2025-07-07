import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, TrendingUp, DollarSign, BarChart3 } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { MainLayout } from "@/components/Layout/MainLayout";
import { reportsApi } from "@/lib/api";

export default function MonthlySalesReport() {
  const [monthsFilter, setMonthsFilter] = useState(12);
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');

  // Fetch monthly sales data
  const { data: monthlySalesData, isLoading } = useQuery({
    queryKey: ['/api/reports/monthly-sales', monthsFilter],
    queryFn: () => reportsApi.getMonthlySalesData(monthsFilter)
  });

  const salesData = monthlySalesData?.data || [];

  // Calculate totals for the selected period
  const totalSales = salesData.reduce((sum, month) => sum + month.sales, 0);
  const totalRevenue = salesData.reduce((sum, month) => sum + month.revenue, 0);
  const averageMonthlySales = salesData.length > 0 ? totalSales / salesData.length : 0;
  const averageMonthlyRevenue = salesData.length > 0 ? totalRevenue / salesData.length : 0;

  // Find best and worst performing months
  const bestMonth = salesData.reduce((best, current) => 
    current.revenue > best.revenue ? current : best, 
    salesData[0] || { month: 'N/A', revenue: 0 }
  );
  
  const worstMonth = salesData.reduce((worst, current) => 
    current.revenue < worst.revenue ? current : worst, 
    salesData[0] || { month: 'N/A', revenue: 0 }
  );

  return (
    <MainLayout title="Monthly Sales Report" subtitle="Track sales performance over time">
      <div className="space-y-6">
        {/* Filters Section */}
        <Card>
          <CardHeader>
            <CardTitle>Report Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">Time Period</label>
                <Select value={monthsFilter.toString()} onValueChange={(value) => setMonthsFilter(parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="6">Last 6 Months</SelectItem>
                    <SelectItem value="12">Last 12 Months</SelectItem>
                    <SelectItem value="24">Last 24 Months</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">Chart Type</label>
                <Select value={chartType} onValueChange={(value: 'line' | 'bar') => setChartType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="line">Line Chart</SelectItem>
                    <SelectItem value="bar">Bar Chart</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalSales.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Last {monthsFilter} months
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
              <p className="text-xs text-muted-foreground">
                Last {monthsFilter} months
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Monthly Sales</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round(averageMonthlySales).toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Per month average
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Monthly Revenue</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${Math.round(averageMonthlyRevenue).toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Per month average
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sales Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Sales Volume</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-80 flex items-center justify-center">
                  <div>Loading chart...</div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  {chartType === 'line' ? (
                    <LineChart data={salesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="sales" stroke="#8884d8" strokeWidth={2} />
                    </LineChart>
                  ) : (
                    <BarChart data={salesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="sales" fill="#8884d8" />
                    </BarChart>
                  )}
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Revenue Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-80 flex items-center justify-center">
                  <div>Loading chart...</div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  {chartType === 'line' ? (
                    <LineChart data={salesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Revenue']} />
                      <Line type="monotone" dataKey="revenue" stroke="#82ca9d" strokeWidth={2} />
                    </LineChart>
                  ) : (
                    <BarChart data={salesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Revenue']} />
                      <Bar dataKey="revenue" fill="#82ca9d" />
                    </BarChart>
                  )}
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Performance Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Best Performing Month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{bestMonth.month}</div>
              <div className="mt-2">
                <div className="text-sm text-muted-foreground">Revenue: ${bestMonth.revenue?.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Sales: {bestMonth.sales?.toLocaleString()} units</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Lowest Performing Month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{worstMonth.month}</div>
              <div className="mt-2">
                <div className="text-sm text-muted-foreground">Revenue: ${worstMonth.revenue?.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Sales: {worstMonth.sales?.toLocaleString()} units</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Data Table */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Sales Data</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Month</th>
                    <th className="text-right py-2">Sales Volume</th>
                    <th className="text-right py-2">Revenue</th>
                    <th className="text-right py-2">Avg. Order Value</th>
                  </tr>
                </thead>
                <tbody>
                  {salesData.map((month) => {
                    const avgOrderValue = month.sales > 0 ? month.revenue / month.sales : 0;
                    return (
                      <tr key={month.month} className="border-b">
                        <td className="py-2 font-medium">{month.month}</td>
                        <td className="text-right py-2">{month.sales.toLocaleString()}</td>
                        <td className="text-right py-2">${month.revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                        <td className="text-right py-2">${avgOrderValue.toFixed(2)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}