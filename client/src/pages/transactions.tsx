import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Filter, Edit2, Trash2, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { MainLayout } from "@/components/Layout/MainLayout";
import { transactionApi, productApi, customerApi, supplierApi, discountApi } from "@/lib/api";

interface Transaction {
  id: number;
  transactionId: string;
  productId: string;
  productName: string;
  quantity: number;
  type: 'purchase' | 'sale';
  customerId: string | null;
  customerName: string;
  supplierId: string | null;
  supplierName: string;
  unitPrice: string;
  totalAmount: string;
  createdAt: string;
}

interface Product {
  id: number;
  productId: string;
  name: string;
  stock: number;
  price: string;
}

interface Customer {
  id: number;
  customerId: string;
  name: string;
  category: string;
}

interface Supplier {
  id: number;
  supplierId: string;
  name: string;
  contactInfo: string;
  category: string;
}

export default function Transactions() {
  const [formOpen, setFormOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [formMode, setFormMode] = useState<"add" | "edit">("add");
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    type: '',
    productId: '',
    customerId: '',
    dateFrom: '',
    dateTo: ''
  });
  const [formData, setFormData] = useState({
    transactionId: '',
    productId: '',
    quantity: 1,
    type: 'sale' as 'purchase' | 'sale',
    customerId: '',
    supplierId: ''
  });

  const [discountPreview, setDiscountPreview] = useState<{
    discountRate: number;
    baseAmount: number;
    discountAmount: number;
    finalAmount: number;
  } | null>(null);

  const pageSize = 10;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch transactions with filters
  const { data: transactionsData, isLoading: transactionsLoading } = useQuery({
    queryKey: ['/api/transactions', currentPage, pageSize, filters],
    queryFn: () => transactionApi.getTransactions({
      page: currentPage,
      limit: pageSize,
      type: filters.type === 'purchase' || filters.type === 'sale' ? filters.type : undefined,
      productId: filters.productId || undefined,
      customerId: filters.customerId || undefined,
      dateFrom: filters.dateFrom || undefined,
      dateTo: filters.dateTo || undefined
    })
  });

  // Fetch products for dropdown
  const { data: productsData } = useQuery({
    queryKey: ['/api/products'],
    queryFn: () => productApi.getProducts({ page: 1, limit: 100 })
  });

  // Fetch customers for dropdown
  const { data: customersData } = useQuery({
    queryKey: ['/api/customers'],
    queryFn: () => customerApi.getAll()
  });

  // Fetch suppliers for dropdown
  const { data: suppliersData } = useQuery({
    queryKey: ['/api/suppliers'],
    queryFn: () => supplierApi.getAll()
  });

  // Calculate discount preview when form data changes
  useEffect(() => {
    calculateDiscountPreview();
  }, [formData.type, formData.customerId, formData.productId, formData.quantity]);

  // Create transaction mutation
  const createTransactionMutation = useMutation({
    mutationFn: (data: any) => transactionApi.createTransaction(data),
    onSuccess: () => {
      toast({ title: "Success", description: "Transaction created successfully" });
      setFormOpen(false);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to create transaction",
        variant: "destructive" 
      });
    }
  });

  // Update transaction mutation
  const updateTransactionMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => transactionApi.updateTransaction(id, data),
    onSuccess: () => {
      toast({ title: "Success", description: "Transaction updated successfully" });
      setFormOpen(false);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to update transaction",
        variant: "destructive" 
      });
    }
  });

  // Delete transaction mutation
  const deleteTransactionMutation = useMutation({
    mutationFn: (id: number) => transactionApi.deleteTransaction(id),
    onSuccess: () => {
      toast({ title: "Success", description: "Transaction deleted successfully" });
      setDeleteDialogOpen(false);
      setDeleteId(null);
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to delete transaction",
        variant: "destructive" 
      });
    }
  });

  const resetForm = () => {
    setFormData({
      transactionId: '',
      productId: '',
      quantity: 1,
      type: 'sale',
      customerId: '',
      supplierId: ''
    });
    setSelectedTransaction(null);
    setDiscountPreview(null);
  };

  // Calculate discount preview
  const calculateDiscountPreview = async () => {
    if (formData.type === 'sale' && formData.customerId && formData.productId && formData.quantity > 0) {
      try {
        const customer = customersData?.data?.find((c: any) => c.customerId === formData.customerId);
        const product = productsData?.data?.find((p: any) => p.productId === formData.productId);
        
        if (customer && product) {
          const discountData = await discountApi.getPreview(formData.quantity, customer.category);
          const baseAmount = parseFloat(product.price) * formData.quantity;
          const discountAmount = baseAmount * discountData.data.discountRate;
          const finalAmount = baseAmount - discountAmount;
          
          setDiscountPreview({
            discountRate: discountData.data.discountRate * 100, // Convert to percentage
            baseAmount,
            discountAmount,
            finalAmount
          });
        }
      } catch (error) {
        console.error('Failed to calculate discount preview:', error);
        setDiscountPreview(null);
      }
    } else {
      setDiscountPreview(null);
    }
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setFormData({
      transactionId: transaction.transactionId,
      productId: transaction.productId,
      quantity: transaction.quantity,
      type: transaction.type,
      customerId: transaction.customerId || '',
      supplierId: transaction.supplierId || ''
    });
    setFormMode("edit");
    setFormOpen(true);
  };

  const handleAddTransaction = () => {
    resetForm();
    setFormMode("add");
    setFormOpen(true);
  };

  const handleSubmitForm = () => {
    if (formMode === "add") {
      const transactionId = `TXN-${Date.now()}`;
      createTransactionMutation.mutate({
        ...formData,
        transactionId
      });
    } else if (selectedTransaction) {
      updateTransactionMutation.mutate({
        id: selectedTransaction.id,
        data: formData
      });
    }
  };

  const handleDeleteTransaction = (id: number) => {
    deleteTransactionMutation.mutate(id);
  };

  const handleDeleteClick = (id: number) => {
    setDeleteId(id);
    setDeleteDialogOpen(true);
  };

  const applyFilters = () => {
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      type: '',
      productId: '',
      customerId: '',
      dateFrom: '',
      dateTo: ''
    });
    setCurrentPage(1);
  };

  const getTypeColor = (type: string) => {
    return type === 'purchase' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800';
  };

  const totalPages = Math.ceil((transactionsData?.pagination?.total || 0) / pageSize);

  return (
    <MainLayout 
      title="Transactions"
      subtitle="Manage purchases and sales transactions"
      showTopBar={false}
    >
      {/* Filters Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-4">
            <Select value={filters.type || undefined} onValueChange={(value) => setFilters({...filters, type: value === 'all' ? '' : value})}>
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="purchase">Purchase</SelectItem>
                <SelectItem value="sale">Sale</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.productId || undefined} onValueChange={(value) => setFilters({...filters, productId: value === 'all' ? '' : value})}>
              <SelectTrigger>
                <SelectValue placeholder="All Products" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Products</SelectItem>
                {productsData?.data?.map((product: Product) => (
                  <SelectItem key={product.productId} value={product.productId}>
                    {product.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.customerId || undefined} onValueChange={(value) => setFilters({...filters, customerId: value === 'all' ? '' : value})}>
              <SelectTrigger>
                <SelectValue placeholder="All Customers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Customers</SelectItem>
                {customersData?.data?.map((customer: Customer) => (
                  <SelectItem key={customer.customerId} value={customer.customerId}>
                    {customer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              type="date"
              placeholder="Date From"
              value={filters.dateFrom}
              onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
            />

            <Input
              type="date"
              placeholder="Date To"
              value={filters.dateTo}
              onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
            />
          </div>
          
          <div className="flex gap-2">
            <Button onClick={applyFilters} size="sm">
              Apply Filters
            </Button>
            <Button onClick={clearFilters} variant="outline" size="sm">
              Clear
            </Button>
            <Button onClick={handleAddTransaction} size="sm" className="ml-auto">
              <Plus className="h-4 w-4 mr-2" />
              Add Transaction
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          {transactionsLoading ? (
            <div className="text-center py-8">Loading transactions...</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4">Transaction ID</th>
                      <th className="text-left p-4">Product</th>
                      <th className="text-left p-4">Type</th>
                      <th className="text-left p-4">Quantity</th>
                      <th className="text-left p-4">Customer/Supplier</th>
                      <th className="text-left p-4">Amount</th>
                      <th className="text-left p-4">Date</th>
                      <th className="text-left p-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactionsData?.data?.map((transaction: Transaction) => (
                      <tr key={transaction.id} className="border-b hover:bg-gray-50">
                        <td className="p-4 font-medium">{transaction.transactionId}</td>
                        <td className="p-4">{transaction.productName}</td>
                        <td className="p-4">
                          <Badge className={getTypeColor(transaction.type)}>
                            {transaction.type}
                          </Badge>
                        </td>
                        <td className="p-4">{transaction.quantity}</td>
                        <td className="p-4">
                          {transaction.type === 'sale' 
                            ? (transaction.customerName || 'N/A')
                            : (transaction.supplierName || 'N/A')
                          }
                        </td>
                        <td className="p-4">${transaction.totalAmount}</td>
                        <td className="p-4">
                          {new Date(transaction.createdAt).toLocaleDateString()}
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditTransaction(transaction)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteClick(transaction.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-between items-center mt-6">
                  <div className="text-sm text-gray-600">
                    Page {currentPage} of {totalPages} ({transactionsData?.pagination?.total || 0} total)
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Transaction Form Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {formMode === "add" ? "Create Transaction" : "Edit Transaction"}
            </DialogTitle>
            <DialogDescription>
              {formMode === "add" ? "Add a new purchase or sale transaction." : "Modify the transaction details."}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="productId">Product</Label>
              <Select value={formData.productId} onValueChange={(value) => setFormData({...formData, productId: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select product" />
                </SelectTrigger>
                <SelectContent>
                  {productsData?.data?.map((product: Product) => (
                    <SelectItem key={product.productId} value={product.productId}>
                      {product.name} (Stock: {product.stock})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value) || 1})}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="type">Type</Label>
              <Select value={formData.type} onValueChange={(value: 'purchase' | 'sale') => setFormData({...formData, type: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="purchase">Purchase</SelectItem>
                  <SelectItem value="sale">Sale</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.type === 'sale' && (
              <div className="grid gap-2">
                <Label htmlFor="customerId">Customer (Optional)</Label>
                <Select value={formData.customerId || undefined} onValueChange={(value) => setFormData({...formData, customerId: value === 'none' ? '' : value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Customer</SelectItem>
                    {customersData?.data?.map((customer: Customer) => (
                      <SelectItem key={customer.customerId} value={customer.customerId}>
                        {customer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {formData.type === 'purchase' && (
              <div className="grid gap-2">
                <Label htmlFor="supplierId">Supplier (Optional)</Label>
                <Select value={formData.supplierId || undefined} onValueChange={(value) => setFormData({...formData, supplierId: value === 'none' ? '' : value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select supplier" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Supplier</SelectItem>
                    {suppliersData?.data?.map((supplier: Supplier) => (
                      <SelectItem key={supplier.supplierId} value={supplier.supplierId}>
                        {supplier.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {discountPreview && formData.type === 'sale' && (
              <div className="grid gap-2 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-sm">Discount Preview</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>Base Amount:</div>
                  <div className="font-medium">${discountPreview.baseAmount.toFixed(2)}</div>
                  <div>Discount ({discountPreview.discountRate}%):</div>
                  <div className="font-medium text-green-600">-${discountPreview.discountAmount.toFixed(2)}</div>
                  <div className="font-semibold">Final Amount:</div>
                  <div className="font-semibold">${discountPreview.finalAmount.toFixed(2)}</div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmitForm}
              disabled={!formData.productId || createTransactionMutation.isPending || updateTransactionMutation.isPending}
            >
              {createTransactionMutation.isPending || updateTransactionMutation.isPending ? "Saving..." : "Save Transaction"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Transaction</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this transaction? This action cannot be undone and will affect product stock levels.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => deleteId && handleDeleteTransaction(deleteId)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
}