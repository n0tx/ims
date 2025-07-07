import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Filter, Edit2, Eye, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { MainLayout } from "@/components/Layout/MainLayout";
import { ProductForm } from "@/components/ProductForm";
import { ProductDetailModal } from "@/components/ProductDetailModal";
import { productApi } from "@/lib/api";
import type { Product } from "@/../../shared/schema";

export default function Products() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [tempSelectedCategories, setTempSelectedCategories] = useState<
    string[]
  >([]);
  const [filterPopoverOpen, setFilterPopoverOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"add" | "edit">("add");
  const [selectedProduct, setSelectedProduct] = useState<Product | undefined>();
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);
  const pageSize = 9;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch products with pagination and filtering
  const { data: productsData, isLoading } = useQuery({
    queryKey: [
      "/api/products",
      currentPage,
      pageSize,
      selectedCategories,
      searchQuery,
    ],
    queryFn: () =>
      productApi.getProducts({
        page: currentPage,
        limit: pageSize,
        categories:
          selectedCategories.length > 0 ? selectedCategories : undefined,
      }),
  });

  // Add product mutation
  const addProductMutation = useMutation({
    mutationFn: productApi.addProduct,
    onSuccess: () => {
      toast({ title: "Product added successfully" });
      setFormOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
    },
  });

  // Update product mutation
  const updateProductMutation = useMutation({
    mutationFn: ({ productId, data }: { productId: string; data: any }) =>
      productApi.updateProduct(productId, data),
    onSuccess: () => {
      toast({ title: "Product updated successfully" });
      setFormOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
    },
  });

  const handleAddProduct = () => {
    setFormMode("add");
    setSelectedProduct(undefined);
    setFormOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setFormMode("edit");
    setSelectedProduct(product);
    setFormOpen(true);
  };

  const handleViewProduct = (product: Product) => {
    setDetailProduct(product);
    setDetailModalOpen(true);
  };

  const handleFormSubmit = async (data: any) => {
    if (formMode === "add") {
      await addProductMutation.mutateAsync(data);
    } else if (selectedProduct) {
      await updateProductMutation.mutateAsync({
        productId: selectedProduct.productId,
        data,
      });
    }
  };

  const handleApplyFilter = () => {
    setSelectedCategories(tempSelectedCategories);
    setFilterPopoverOpen(false);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSelectedCategories([]);
    setTempSelectedCategories([]);
    setFilterPopoverOpen(false);
    setCurrentPage(1);
  };

  const handleCategoryToggle = (category: string, checked: boolean) => {
    if (checked) {
      setTempSelectedCategories([...tempSelectedCategories, category]);
    } else {
      setTempSelectedCategories(
        tempSelectedCategories.filter((c) => c !== category),
      );
    }
  };

  const handleRemoveCategory = (category: string) => {
    setSelectedCategories(selectedCategories.filter((c) => c !== category));
    setCurrentPage(1);
  };

  const filteredProducts =
    productsData?.data?.filter((product: Product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.productId.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    }) || [];

  const categories = Array.from(
    new Set(
      productsData?.data?.map((product: Product) => product.category) || [],
    ),
  );

  return (
    <MainLayout
      title="Products"
      subtitle="Manage your inventory products"
      showTopBar={false}
    >
      {/* Search and Filter Bar */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex gap-2 flex-wrap">
              {/* Filter Popover */}
              <Popover
                open={filterPopoverOpen}
                onOpenChange={setFilterPopoverOpen}
              >
                <PopoverTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    Filter
                    {selectedCategories.length > 0 && (
                      <Badge variant="secondary" className="ml-1">
                        {selectedCategories.length}
                      </Badge>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0">
                  <div className="p-4">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Categories</h4>
                        <div className="space-y-2">
                          {categories.map((category) => (
                            <div
                              key={category}
                              className="flex items-center space-x-2"
                            >
                              <Checkbox
                                id={category}
                                checked={tempSelectedCategories.includes(
                                  category,
                                )}
                                onCheckedChange={(checked) =>
                                  handleCategoryToggle(
                                    category,
                                    checked as boolean,
                                  )
                                }
                              />
                              <label
                                htmlFor={category}
                                className="text-sm font-medium cursor-pointer"
                              >
                                {category}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button onClick={handleApplyFilter} size="sm">
                          Apply Filter
                        </Button>
                        <Button
                          onClick={handleClearFilters}
                          variant="outline"
                          size="sm"
                        >
                          Clear All
                        </Button>
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              {/* Add Product Button */}
              <Button
                onClick={handleAddProduct}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Product
              </Button>
            </div>
          </div>

          {/* Active Filter Tags */}
          {selectedCategories.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {selectedCategories.map((category) => (
                <Badge
                  key={category}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {category}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => handleRemoveCategory(category)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Products Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-3">
          {[...Array(8)].map((_, index) => (
            <Card key={index} className="h-64">
              <CardHeader className="pb-3">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                  <Skeleton className="h-8 w-1/3" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          {filteredProducts.length === 0 ? (
            <Card className="p-8">
              <div className="text-center">
                <p className="text-gray-500 dark:text-gray-400">
                  {searchQuery || selectedCategories.length > 0
                    ? "No products found matching your criteria"
                    : "No products available"}
                </p>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-3">
              {filteredProducts.map((product: Product) => (
                <Card
                  key={product.id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg font-semibold truncate">
                          {product.name}
                        </CardTitle>
                        <CardDescription className="text-sm text-gray-500">
                          SKU: {product.productId}
                        </CardDescription>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewProduct(product)}
                          className="h-8 w-8 p-0"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditProduct(product)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Category:
                        </span>
                        <Badge variant="outline">{product.category}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Price:
                        </span>
                        <span className="font-medium">${product.price}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Stock:
                        </span>
                        <Badge
                          variant={
                            product.stock > 10
                              ? "default"
                              : product.stock > 0
                                ? "secondary"
                                : "destructive"
                          }
                        >
                          {product.stock} units
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Pagination */}
          {productsData &&
            productsData.pagination &&
            productsData.pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <Button
                  variant="outline"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Page {currentPage} of {productsData.pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  disabled={currentPage === productsData.pagination.totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  Next
                </Button>
              </div>
            )}
        </>
      )}

      {/* Product Form Dialog */}
      <ProductForm
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
        product={selectedProduct}
        mode={formMode}
        isLoading={
          addProductMutation.isPending || updateProductMutation.isPending
        }
      />

      {/* Product Detail Modal */}
      <ProductDetailModal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        product={detailProduct}
      />
    </MainLayout>
  );
}
