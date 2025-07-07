import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { TrendingUp, Package, DollarSign, Percent } from "lucide-react";
import { MainLayout } from "@/components/Layout/MainLayout";
import { reportsApi } from "@/lib/api";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658'];

export default function CategorySalesReport() {
  // Fetch category sales data
  const { data: categorySalesData, isLoading } = useQuery({
    queryKey: ['/api/reports/category-sales'],
    queryFn: () => reportsApi.getCategorySalesData()
  });

  const salesData = categorySalesData?.data || [];

  // Calculate totals
  const totalSales = salesData.reduce((sum, category) => sum + category.sales, 0);
  const totalRevenue = salesData.reduce((sum, category) => sum + category.revenue, 0);

  // Find top performing category
  const topCategory = salesData.reduce((top, current) => 
    current.revenue > top.revenue ? current : top, 
    salesData[0] || { category: 'N/A', revenue: 0, sales: 0, percentage: 0 }
  );

  // Prepare data for charts
  const pieChartData = salesData.map((item, index) => ({
    ...item,
    fill: COLORS[index % COLORS.length]
  }));

  return (
    <MainLayout title="Category Sales Report" subtitle="Sales performance analysis by product category">
      <div className="space-y-6">
        {/* Summary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Categories</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{salesData.length}</div>
              <p className="text-xs text-muted-foreground">
                Active categories
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalSales.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Units sold
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
                Across all categories
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Top Category</CardTitle>
              <Percent className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{topCategory.category}</div>
              <p className="text-xs text-muted-foreground">
                {topCategory.percentage?.toFixed(1)}% of total revenue
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue Distribution by Category</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-80 flex items-center justify-center">
                  <div>Loading chart...</div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ category, percentage }) => `${category} (${percentage?.toFixed(1)}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="revenue"
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Revenue']} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Bar Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Sales Volume by Category</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-80 flex items-center justify-center">
                  <div>Loading chart...</div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={salesData} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="category" type="category" width={80} />
                    <Tooltip />
                    <Bar dataKey="sales" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Revenue vs Sales Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue vs Sales Volume Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-80 flex items-center justify-center">
                <div>Loading chart...</div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="sales" fill="#8884d8" name="Sales Volume" />
                  <Bar yAxisId="right" dataKey="revenue" fill="#82ca9d" name="Revenue ($)" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Category Performance Table */}
        <Card>
          <CardHeader>
            <CardTitle>Category Performance Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Category</th>
                    <th className="text-right py-2">Sales Volume</th>
                    <th className="text-right py-2">Revenue</th>
                    <th className="text-right py-2">Revenue %</th>
                    <th className="text-right py-2">Avg. Unit Price</th>
                    <th className="text-center py-2">Performance</th>
                  </tr>
                </thead>
                <tbody>
                  {salesData
                    .sort((a, b) => b.revenue - a.revenue)
                    .map((category, index) => {
                      const avgUnitPrice = category.sales > 0 ? category.revenue / category.sales : 0;
                      const performanceLevel = 
                        category.percentage > 30 ? 'excellent' :
                        category.percentage > 20 ? 'good' :
                        category.percentage > 10 ? 'average' : 'poor';
                      
                      return (
                        <tr key={category.category} className="border-b">
                          <td className="py-2">
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-3 h-3 rounded"
                                style={{ backgroundColor: COLORS[index % COLORS.length] }}
                              />
                              <span className="font-medium">{category.category}</span>
                            </div>
                          </td>
                          <td className="text-right py-2">{category.sales.toLocaleString()}</td>
                          <td className="text-right py-2">${category.revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                          <td className="text-right py-2">{category.percentage.toFixed(1)}%</td>
                          <td className="text-right py-2">${avgUnitPrice.toFixed(2)}</td>
                          <td className="text-center py-2">
                            <Badge 
                              variant={performanceLevel === 'excellent' ? 'default' : 'secondary'}
                              className={
                                performanceLevel === 'excellent' ? 'bg-green-100 text-green-800' :
                                performanceLevel === 'good' ? 'bg-blue-100 text-blue-800' :
                                performanceLevel === 'average' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                              }
                            >
                              {performanceLevel === 'excellent' ? 'Excellent' :
                               performanceLevel === 'good' ? 'Good' :
                               performanceLevel === 'average' ? 'Average' : 'Needs Attention'}
                            </Badge>
                          </td>
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