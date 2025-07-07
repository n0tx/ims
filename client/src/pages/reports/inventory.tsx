import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Package, DollarSign, AlertTriangle } from "lucide-react";
import { MainLayout } from "@/components/Layout/MainLayout";
import { reportsApi, productApi } from "@/lib/api";

interface Product {
  id: number;
  productId: string;
  name: string;
  price: string;
  stock: number;
  category: string;
  lowStockThreshold: number;
}

export default function InventoryReport() {
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Fetch inventory value
  const { data: inventoryValue } = useQuery({
    queryKey: ['/api/reports/inventory'],
    queryFn: () => reportsApi.getInventoryValue()
  });

  // Fetch products for inventory details
  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ['/api/products', { limit: 1000 }],
    queryFn: () => productApi.getProducts({ page: 1, limit: 1000 })
  });

  // Fetch low stock products
  const { data: lowStockData } = useQuery({
    queryKey: ['/api/reports/low-stock'],
    queryFn: () => reportsApi.getLowStockProducts()
  });

  // Get unique categories for filter
  const categories = Array.from(new Set(productsData?.data?.map((product: Product) => product.category) || []));

  // Filter products by category
  const filteredProducts = productsData?.data?.filter((product: Product) => {
    if (categoryFilter === 'all') return true;
    return product.category === categoryFilter;
  }) || [];

  // Calculate filtered inventory metrics
  const filteredInventoryValue = filteredProducts.reduce((total, product) => {
    return total + (parseFloat(product.price) * product.stock);
  }, 0);

  const filteredLowStockCount = filteredProducts.filter((product: Product) => 
    product.stock <= product.lowStockThreshold
  ).length;

  return (
    <MainLayout title="Inventory Report" subtitle="Detailed inventory analysis and stock overview">
      <div className="space-y-6">
        {/* Filter Section */}
        <Card>
          <CardHeader>
            <CardTitle>Filter by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-64">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {categoryFilter === 'all' ? 'Total Inventory Value' : `${categoryFilter} Category Value`}
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${categoryFilter === 'all' 
                  ? Number(inventoryValue?.data || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })
                  : filteredInventoryValue.toLocaleString('en-US', { minimumFractionDigits: 2 })
                }
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {categoryFilter === 'all' ? 'Total Products' : `Products in ${categoryFilter}`}
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {filteredProducts.length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {categoryFilter === 'all' ? 'Low Stock Products' : `Low Stock in ${categoryFilter}`}
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {categoryFilter === 'all' ? lowStockData?.data?.length || 0 : filteredLowStockCount}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Product List */}
        <Card>
          <CardHeader>
            <CardTitle>
              {categoryFilter === 'all' ? 'All Products' : `Products in ${categoryFilter} Category`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {productsLoading ? (
              <div className="text-center py-8">Loading products...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Product</th>
                      <th className="text-left py-2">Category</th>
                      <th className="text-right py-2">Stock</th>
                      <th className="text-right py-2">Unit Price</th>
                      <th className="text-right py-2">Total Value</th>
                      <th className="text-center py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((product: Product) => {
                      const totalValue = parseFloat(product.price) * product.stock;
                      const isLowStock = product.stock <= product.lowStockThreshold;
                      
                      return (
                        <tr key={product.productId} className="border-b">
                          <td className="py-2">
                            <div>
                              <div className="font-medium">{product.name}</div>
                              <div className="text-sm text-gray-500">{product.productId}</div>
                            </div>
                          </td>
                          <td className="py-2">{product.category}</td>
                          <td className="text-right py-2">{product.stock}</td>
                          <td className="text-right py-2">${parseFloat(product.price).toFixed(2)}</td>
                          <td className="text-right py-2">${totalValue.toFixed(2)}</td>
                          <td className="text-center py-2">
                            <Badge 
                              variant={isLowStock ? "destructive" : "default"}
                              className={isLowStock ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}
                            >
                              {isLowStock ? "Low Stock" : "In Stock"}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}