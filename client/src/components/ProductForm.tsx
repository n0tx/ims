import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import type { Product } from "@/../../shared/schema";

const productSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  name: z.string().min(1, "Product name is required"),
  price: z.string().min(1, "Price is required").refine((val) => !isNaN(Number(val)) && Number(val) > 0, "Price must be a positive number"),
  stock: z.string().min(0, "Stock cannot be negative").refine((val) => !isNaN(Number(val)) && Number(val) >= 0, "Stock must be a valid number"),
  category: z.string().min(1, "Category is required"),
  lowStockThreshold: z.string().min(1, "Low stock threshold is required").refine((val) => !isNaN(Number(val)) && Number(val) >= 0, "Threshold must be a valid number"),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  product?: Product;
  mode: "add" | "edit";
  isLoading?: boolean;
}

const categories = [
  "Electronics",
  "Clothing",
  "Home & Garden",
  "Sports & Outdoors",
  "Health & Beauty",
  "Books",
  "Toys & Games",
  "Automotive",
  "Food & Beverages",
  "Office Supplies"
];

export function ProductForm({ isOpen, onClose, onSubmit, product, mode, isLoading = false }: ProductFormProps) {
  const { toast } = useToast();
  
  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      productId: "",
      name: "",
      price: "",
      stock: "0",
      category: "",
      lowStockThreshold: "10",
    },
  });

  // Reset form when product changes or modal opens
  useEffect(() => {
    if (isOpen) {
      const formValues = {
        productId: product?.productId || "",
        name: product?.name || "",
        price: product?.price?.toString() || "",
        stock: product?.stock?.toString() || "0",
        category: product?.category || "",
        lowStockThreshold: product?.lowStockThreshold?.toString() || "10",
      };
      form.reset(formValues);
    }
  }, [isOpen, product, form]);

  const handleSubmit = async (data: ProductFormData) => {
    try {
      // Validate and format numeric fields
      const price = parseFloat(data.price);
      const stock = parseInt(data.stock);
      const lowStockThreshold = parseInt(data.lowStockThreshold);
      
      if (isNaN(price) || price < 0) {
        throw new Error("Price must be a valid positive number");
      }
      if (isNaN(stock) || stock < 0) {
        throw new Error("Stock must be a valid non-negative number");
      }
      if (isNaN(lowStockThreshold) || lowStockThreshold < 0) {
        throw new Error("Low stock threshold must be a valid non-negative number");
      }
      
      const formattedData = {
        ...data,
        price,
        stock,
        lowStockThreshold,
      };
      
      await onSubmit(formattedData);
      form.reset();
      onClose();
      toast({
        title: mode === "add" ? "Product added" : "Product updated",
        description: `${data.name} has been ${mode === "add" ? "added" : "updated"} successfully.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{mode === "add" ? "Add New Product" : "Edit Product"}</DialogTitle>
          <DialogDescription>
            {mode === "add" 
              ? "Enter the details for the new product." 
              : "Update the product information below."
            }
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="productId">Product ID</Label>
              <Input
                id="productId"
                {...form.register("productId")}
                placeholder="Enter product ID"
                disabled={mode === "edit"}
              />
              {form.formState.errors.productId && (
                <p className="text-sm text-red-600">{form.formState.errors.productId.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="name">Product Name</Label>
              <Input
                id="name"
                {...form.register("name")}
                placeholder="Enter product name"
              />
              {form.formState.errors.name && (
                <p className="text-sm text-red-600">{form.formState.errors.name.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price ($)</Label>
              <Input
                id="price"
                {...form.register("price")}
                type="number"
                step="0.01"
                placeholder="0.00"
              />
              {form.formState.errors.price && (
                <p className="text-sm text-red-600">{form.formState.errors.price.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="stock">Stock Quantity</Label>
              <Input
                id="stock"
                {...form.register("stock")}
                type="number"
                placeholder="0"
              />
              {form.formState.errors.stock && (
                <p className="text-sm text-red-600">{form.formState.errors.stock.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select onValueChange={(value) => form.setValue("category", value)} defaultValue={form.watch("category")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.category && (
                <p className="text-sm text-red-600">{form.formState.errors.category.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="lowStockThreshold">Low Stock Alert</Label>
              <Input
                id="lowStockThreshold"
                {...form.register("lowStockThreshold")}
                type="number"
                placeholder="10"
              />
              {form.formState.errors.lowStockThreshold && (
                <p className="text-sm text-red-600">{form.formState.errors.lowStockThreshold.message}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : mode === "add" ? "Add Product" : "Update Product"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}