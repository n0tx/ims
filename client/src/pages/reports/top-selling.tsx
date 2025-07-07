import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trophy, TrendingUp, Package, DollarSign, Medal, Award } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { MainLayout } from "@/components/Layout/MainLayout";
import { reportsApi } from "@/lib/api";

const COLORS = ['#FFD700', '#C0C0C0', '#CD7F32', '#4CAF50', '#2196F3', '#FF9800', '#9C27B0', '#F44336', '#607D8B', '#795548'];

interface TopProduct {
  rank: number;
  productId: string;
  name: string;
  category: string;
  revenue: number;
  quantitySold: number;
  sku?: string;
}

export default function TopSellingReport() {
  const [limitFilter, setLimitFilter] = useState(10);

  // Fetch top selling products
  const { data: topProductsData, isLoading } = useQuery({
    queryKey: ['/api/reports/top-selling', limitFilter],
    queryFn: () => reportsApi.getTopSellingProducts(limitFilter)
  });

  const topProducts = topProductsData?.data || [];

  // Calculate totals for top products
  const totalRevenue = topProducts.reduce((sum, product) => sum + product.revenue, 0);
  const totalQuantity = topProducts.reduce((sum, product) => sum + product.quantitySold, 0);
  const averageRevenue = topProducts.length > 0 ? totalRevenue / topProducts.length : 0;
  const averageQuantity = topProducts.length > 0 ? totalQuantity / topProducts.length : 0;

  // Get rank icons
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2: return <Medal className="h-5 w-5 text-gray-400" />;
      case 3: return <Award className="h-5 w-5 text-amber-600" />;
      default: return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>;
    }
  };

  // Get rank badge color
  const getRankBadgeColor = (rank: number) => {
    if (rank <= 3) return "bg-yellow-100 text-yellow-800";
    if (rank <= 5) return "bg-blue-100 text-blue-800";
    return "bg-gray-100 text-gray-800";
  };

  // Prepare data for charts
  const revenueChartData = topProducts.slice(0, 8).map((product, index) => ({
    ...product,
    fill: COLORS[index % COLORS.length]
  }));

  const quantityChartData = topProducts.slice(0, 8);

  return (
    <MainLayout title="Top-Selling Products Report" subtitle="Best performing products by revenue and sales volume">
      <div className="space-y-6">
        {/* Filters Section */}
        <Card>
          <CardHeader>
            <CardTitle>Report Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium">Number of Products:</label>
              <Select value={limitFilter.toString()} onValueChange={(value) => setLimitFilter(parseInt(value))}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">Top 5</SelectItem>
                  <SelectItem value="10">Top 10</SelectItem>
                  <SelectItem value="15">Top 15</SelectItem>
                  <SelectItem value="20">Top 20</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Summary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Top Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{topProducts.length}</div>
              <p className="text-xs text-muted-foreground">
                Products analyzed
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
                From top {limitFilter} products
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Units Sold</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalQuantity.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Units sold
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Revenue/Product</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${Math.round(averageRevenue).toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Average performance
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Top 3 Products Spotlight */}
        {topProducts.length >= 3 && (
          <Card>
            <CardHeader>
              <CardTitle>🏆 Top 3 Performers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {topProducts.slice(0, 3).map((product, index) => (
                  <div key={product.productId} className="text-center p-4 border rounded-lg">
                    <div className="flex justify-center mb-2">
                      {getRankIcon(product.rank)}
                    </div>
                    <h3 className="font-semibold text-lg mb-1">{product.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{product.category}</p>
                    <div className="space-y-1">
                      <div className="text-2xl font-bold text-green-600">
                        ${product.revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {product.quantitySold.toLocaleString()} units sold
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Bar Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue by Product</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-80 flex items-center justify-center">
                  <div>Loading chart...</div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={revenueChartData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={100} />
                    <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Revenue']} />
                    <Bar dataKey="revenue" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Quantity Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Sales Volume Distribution</CardTitle>
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
                      data={quantityChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, quantitySold }) => `${name}: ${quantitySold}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="quantitySold"
                    >
                      {quantityChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Detailed Rankings Table */}
        <Card>
          <CardHeader>
            <CardTitle>Complete Rankings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-center py-2">Rank</th>
                    <th className="text-left py-2">Product</th>
                    <th className="text-left py-2">Category</th>
                    <th className="text-right py-2">Revenue</th>
                    <th className="text-right py-2">Units Sold</th>
                    <th className="text-right py-2">Avg. Unit Price</th>
                    <th className="text-center py-2">Performance</th>
                  </tr>
                </thead>
                <tbody>
                  {topProducts.map((product) => {
                    const avgUnitPrice = product.quantitySold > 0 ? product.revenue / product.quantitySold : 0;
                    
                    return (
                      <tr key={product.productId} className="border-b hover:bg-gray-50">
                        <td className="text-center py-3">
                          <div className="flex items-center justify-center">
                            {getRankIcon(product.rank)}
                          </div>
                        </td>
                        <td className="py-3">
                          <div>
                            <div className="font-medium">{product.name}</div>
                            <div className="text-sm text-gray-500">{product.productId}</div>
                          </div>
                        </td>
                        <td className="py-3">{product.category}</td>
                        <td className="text-right py-3 font-medium">
                          ${product.revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="text-right py-3">{product.quantitySold.toLocaleString()}</td>
                        <td className="text-right py-3">${avgUnitPrice.toFixed(2)}</td>
                        <td className="text-center py-3">
                          <Badge className={getRankBadgeColor(product.rank)}>
                            {product.rank <= 3 ? 'Top Performer' :
                             product.rank <= 5 ? 'High Performer' :
                             product.rank <= 10 ? 'Good Performer' : 'Standard'}
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