import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { Product } from "@/../../shared/schema";

interface ProductDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
}

export function ProductDetailModal({ isOpen, onClose, product }: ProductDetailModalProps) {
  if (!product) return null;

  const isLowStock = product.stock <= product.lowStockThreshold;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Product Details</DialogTitle>
          <DialogDescription>
            View complete product information and stock status.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Product Header */}
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold">{product.name}</h3>
              <p className="text-sm text-gray-600">{product.productId}</p>
            </div>
            <Badge variant={isLowStock ? "destructive" : "default"}>
              {isLowStock ? "Low Stock" : "In Stock"}
            </Badge>
          </div>

          {/* Product Information Grid */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    ${parseFloat(product.price).toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-600">Price</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className={`text-2xl font-bold ${isLowStock ? 'text-red-600' : 'text-blue-600'}`}>
                    {product.stock}
                  </p>
                  <p className="text-sm text-gray-600">Stock Quantity</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-xl font-semibold text-purple-600">
                    {product.category}
                  </p>
                  <p className="text-sm text-gray-600">Category</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-xl font-semibold text-orange-600">
                    {product.lowStockThreshold}
                  </p>
                  <p className="text-sm text-gray-600">Low Stock Alert</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional Information */}
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm font-medium text-gray-700">Total Value:</span>
              <span className="text-sm font-semibold">
                ${(parseFloat(product.price) * product.stock).toFixed(2)}
              </span>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm font-medium text-gray-700">Created:</span>
              <span className="text-sm text-gray-600">
                {new Date(product.createdAt).toLocaleDateString()}
              </span>
            </div>

            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm font-medium text-gray-700">Last Updated:</span>
              <span className="text-sm text-gray-600">
                {new Date(product.updatedAt).toLocaleDateString()}
              </span>
            </div>

            {isLowStock && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">
                  <strong>⚠️ Low Stock Alert:</strong> This product is running low on stock. 
                  Current quantity ({product.stock}) is at or below the threshold ({product.lowStockThreshold}).
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}