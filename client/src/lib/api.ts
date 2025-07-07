/**
 * API Client for Inventory Management System
 * Handles all communication with the backend API running on port 8000
 */

const API_BASE_URL = '/api';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  error: {
    message: string;
    code: string;
    statusCode: number;
  };
}

/**
 * Generic API request handler with error handling
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers: defaultHeaders,
    });

    const data = await response.json();

    if (!response.ok) {
      const error = data as ApiError;
      throw new Error(error.error?.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unexpected error occurred while making the API request');
  }
}

/**
 * Product API methods
 */
export const productApi = {
  /**
   * Get all products with optional pagination and filtering
   */
  getProducts: (params?: {
    page?: number;
    limit?: number;
    category?: string;
    categories?: string[];
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.category) searchParams.set('category', params.category);
    if (params?.categories && params.categories.length > 0) {
      searchParams.set('categories', params.categories.join(','));
    }
    
    const query = searchParams.toString();
    return apiRequest<ApiResponse<any[]>>(`/products${query ? `?${query}` : ''}`);
  },

  /**
   * Add a new product
   */
  addProduct: (product: {
    productId: string;
    name: string;
    price: number;
    stock: number;
    category: string;
  }) => {
    return apiRequest<ApiResponse<any>>('/products', {
      method: 'POST',
      body: JSON.stringify(product),
    });
  },

  /**
   * Update an existing product
   */
  updateProduct: (productId: string, updates: Partial<{
    name: string;
    price: number;
    stock: number;
    category: string;
    lowStockThreshold: number;
  }>) => {
    return apiRequest<ApiResponse<any>>(`/products/${productId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  /**
   * Get product transaction history
   */
  getProductHistory: (productId: string, params?: {
    page?: number;
    limit?: number;
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    
    const query = searchParams.toString();
    return apiRequest<ApiResponse<any[]>>(`/products/${productId}/history${query ? `?${query}` : ''}`);
  },
};

/**
 * Transaction API methods
 */
export const transactionApi = {
  /**
   * Get all transactions with optional filtering and pagination
   */
  getTransactions: (params?: {
    page?: number;
    limit?: number;
    type?: 'purchase' | 'sale';
    productId?: string;
    customerId?: string;
    dateFrom?: string;
    dateTo?: string;
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.type) searchParams.set('type', params.type);
    if (params?.productId) searchParams.set('productId', params.productId);
    if (params?.customerId) searchParams.set('customerId', params.customerId);
    if (params?.dateFrom) searchParams.set('dateFrom', params.dateFrom);
    if (params?.dateTo) searchParams.set('dateTo', params.dateTo);
    
    const query = searchParams.toString();
    return apiRequest<ApiResponse<any[]>>(`/transactions${query ? `?${query}` : ''}`);
  },

  /**
   * Get a single transaction by ID
   */
  getTransaction: (id: number) => {
    return apiRequest<ApiResponse<any>>(`/transactions/${id}`);
  },

  /**
   * Create a new transaction
   */
  createTransaction: (transaction: {
    transactionId: string;
    productId: string;
    quantity: number;
    type: 'purchase' | 'sale';
    customerId?: string;
  }) => {
    return apiRequest<ApiResponse<any>>('/transactions', {
      method: 'POST',
      body: JSON.stringify(transaction),
    });
  },

  /**
   * Update an existing transaction
   */
  updateTransaction: (id: number, transaction: {
    transactionId?: string;
    productId?: string;
    quantity?: number;
    type?: 'purchase' | 'sale';
    customerId?: string;
  }) => {
    return apiRequest<ApiResponse<any>>(`/transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(transaction),
    });
  },

  /**
   * Delete a transaction
   */
  deleteTransaction: (id: number) => {
    return apiRequest<ApiResponse<{ message: string }>>(`/transactions/${id}`, {
      method: 'DELETE',
    });
  },
};

/**
 * Reports API methods
 */
export const reportsApi = {
  /**
   * Get dashboard metrics
   */
  getDashboardMetrics: () => {
    return apiRequest<ApiResponse<{
      totalProducts: number;
      inventoryValue: string;
      lowStockCount: number;
      totalRevenue: string;
    }>>('/reports/dashboard');
  },

  /**
   * Get total inventory value
   */
  getInventoryValue: () => {
    return apiRequest<ApiResponse<{ totalValue: string }>>('/reports/inventory');
  },

  /**
   * Get low stock products
   */
  getLowStockProducts: (threshold?: number) => {
    const query = threshold ? `?threshold=${threshold}` : '';
    return apiRequest<ApiResponse<any[]>>(`/reports/low-stock${query}`);
  },

  /**
   * Get top selling products
   */
  getTopSellingProducts: (limit: number = 10) => {
    return apiRequest<ApiResponse<{
      rank: number;
      productId: string;
      name: string;
      category: string;
      revenue: number;
      quantitySold: number;
      sku: string;
    }[]>>(`/reports/top-selling?limit=${limit}`);
  },

  /**
   * Get monthly sales data
   */
  getMonthlySalesData: (months: number = 12) => {
    return apiRequest<ApiResponse<{
      month: string;
      sales: number;
      revenue: number;
    }[]>>(`/reports/monthly-sales?months=${months}`);
  },

  /**
   * Get category sales data
   */
  getCategorySalesData: () => {
    return apiRequest<ApiResponse<{
      category: string;
      sales: number;
      revenue: number;
      percentage: number;
    }[]>>('/reports/category-sales');
  },
};

/**
 * Customer API methods
 */
export const customerApi = {
  /**
   * Get all customers
   */
  getAll: () => {
    return apiRequest<ApiResponse<any[]>>('/customers');
  },

  /**
   * Create a new customer
   */
  create: (customer: any) => {
    return apiRequest<ApiResponse<any>>('/customers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(customer),
    });
  },

  /**
   * Update an existing customer
   */
  update: (id: number, customer: any) => {
    return apiRequest<ApiResponse<any>>(`/customers/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(customer),
    });
  },

  /**
   * Delete a customer
   */
  delete: (id: number) => {
    return apiRequest<ApiResponse<{ message: string }>>(`/customers/${id}`, {
      method: 'DELETE',
    });
  },
};

/**
 * Supplier API methods
 */
export const supplierApi = {
  /**
   * Get all suppliers
   */
  getAll: () => {
    return apiRequest<ApiResponse<any[]>>('/suppliers');
  },

  /**
   * Create a new supplier
   */
  create: (supplier: any) => {
    return apiRequest<ApiResponse<any>>('/suppliers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(supplier),
    });
  },

  /**
   * Update an existing supplier
   */
  update: (id: number, supplier: any) => {
    return apiRequest<ApiResponse<any>>(`/suppliers/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(supplier),
    });
  },

  /**
   * Delete a supplier
   */
  delete: (id: number) => {
    return apiRequest<ApiResponse<{ message: string }>>(`/suppliers/${id}`, {
      method: 'DELETE',
    });
  },
};

/**
 * Discount API methods
 */
export const discountApi = {
  /**
   * Get discount preview
   */
  getPreview: (quantity: number, category: string) => {
    return apiRequest<ApiResponse<{ discountRate: number; quantity: number; customerCategory: string }>>(`/discount-preview?quantity=${quantity}&category=${category}`);
  },
};

/**
 * Combined API object for easy imports
 */
export const api = {
  products: productApi,
  transactions: transactionApi,
  customers: customerApi,
  suppliers: supplierApi,
  discounts: discountApi,
  reports: reportsApi,
};

export default api;
