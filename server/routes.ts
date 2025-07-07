import type { Express } from "express";
import { createServer, type Server } from "http";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { products, transactions, customers, suppliers, discountRules, insertProductSchema, insertTransactionSchema, insertCustomerSchema, insertSupplierSchema, insertDiscountRuleSchema } from "../shared/schema";
import { eq, sql, desc, and, sum, count, inArray } from "drizzle-orm";

const pool = new Pool({connectionString: process.env.DATABASE_URL});
const db = drizzle(pool);

export async function registerRoutes(app: Express): Promise<Server> {
  // Products endpoints
  app.get('/api/products', async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 5;
      const category = req.query.category as string;
      const categoriesParam = req.query.categories as string;
      const offset = (page - 1) * limit;

      // Parse multiple categories from comma-separated string
      const categories = categoriesParam ? categoriesParam.split(',').map(c => c.trim()) : [];

      let productsData;
      let whereCondition;
      
      // Build where condition based on filter type
      if (categories.length > 0) {
        whereCondition = inArray(products.category, categories);
      } else if (category) {
        whereCondition = eq(products.category, category);
      }
      
      if (whereCondition) {
        productsData = await db.select().from(products)
          .where(whereCondition)
          .limit(limit)
          .offset(offset);
      } else {
        productsData = await db.select().from(products)
          .limit(limit)
          .offset(offset);
      }
      
      // Get total count for pagination
      const totalQuery = whereCondition 
        ? db.select({ count: count() }).from(products).where(whereCondition)
        : db.select({ count: count() }).from(products);
      
      const [{ count: total }] = await totalQuery;

      res.json({
        success: true,
        data: productsData,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Products fetch error:', error);
      res.status(500).json({
        error: {
          message: "Failed to fetch products",
          code: "PRODUCTS_FETCH_ERROR"
        }
      });
    }
  });

  app.post('/api/products', async (req, res) => {
    try {
      const validatedData = insertProductSchema.parse(req.body);
      const [newProduct] = await db.insert(products).values(validatedData).returning();
      
      res.status(201).json({
        success: true,
        data: newProduct
      });
    } catch (error) {
      console.error('Product creation error:', error);
      res.status(400).json({
        error: {
          message: "Failed to create product",
          code: "PRODUCT_CREATION_ERROR"
        }
      });
    }
  });

  app.put('/api/products/:id', async (req, res) => {
    try {
      const productId = req.params.id;
      const updateData = req.body;
      

      
      // Clean up the update data to ensure proper types
      const cleanUpdateData: any = {};
      
      // Only include fields that are actually being updated
      if (updateData.name !== undefined) {
        cleanUpdateData.name = updateData.name;
      }
      if (updateData.category !== undefined) {
        cleanUpdateData.category = updateData.category;
      }
      if (updateData.price !== undefined) {
        const parsedPrice = parseFloat(updateData.price);
        if (isNaN(parsedPrice)) {
          throw new Error(`Invalid price value: ${updateData.price}`);
        }
        cleanUpdateData.price = parsedPrice;
      }
      if (updateData.stock !== undefined) {
        const parsedStock = parseInt(updateData.stock);
        if (isNaN(parsedStock)) {
          throw new Error(`Invalid stock value: ${updateData.stock}`);
        }
        cleanUpdateData.stock = parsedStock;
      }
      if (updateData.lowStockThreshold !== undefined) {
        const parsedThreshold = parseInt(updateData.lowStockThreshold);
        if (isNaN(parsedThreshold)) {
          throw new Error(`Invalid low stock threshold value: ${updateData.lowStockThreshold}`);
        }
        cleanUpdateData.lowStockThreshold = parsedThreshold;
      }
      

      
      // Find the product first to get its database ID
      const existingProduct = await db
        .select()
        .from(products)
        .where(eq(products.productId, productId))
        .limit(1);
      
      if (existingProduct.length === 0) {
        return res.status(404).json({
          error: {
            message: "Product not found",
            code: "PRODUCT_NOT_FOUND",
            statusCode: 404
          }
        });
      }
      
      // Make sure to exclude undefined fields from the update
      const fieldsToUpdate = Object.keys(cleanUpdateData).length > 0 ? 
        { ...cleanUpdateData, updatedAt: new Date() } : 
        { updatedAt: new Date() };
      
      const [updatedProduct] = await db
        .update(products)
        .set(fieldsToUpdate)
        .where(eq(products.id, existingProduct[0].id))
        .returning();

      if (!updatedProduct) {
        return res.status(404).json({
          error: {
            message: "Product not found",
            code: "PRODUCT_NOT_FOUND"
          }
        });
      }

      res.json({
        success: true,
        data: updatedProduct
      });
    } catch (error) {
      console.error('Product update error:', error);
      res.status(500).json({
        error: {
          message: "Failed to update product",
          code: "PRODUCT_UPDATE_ERROR"
        }
      });
    }
  });

  // Transactions endpoints
  app.get('/api/transactions', async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 5;
      const offset = (page - 1) * limit;
      
      // Filter parameters
      const type = req.query.type as string;
      const productId = req.query.productId as string;
      const customerId = req.query.customerId as string;
      const dateFrom = req.query.dateFrom as string;
      const dateTo = req.query.dateTo as string;
      
      // Build where conditions
      const whereConditions = [];
      
      if (type) {
        whereConditions.push(eq(transactions.type, type));
      }
      if (productId) {
        whereConditions.push(eq(transactions.productId, productId));
      }
      if (customerId) {
        whereConditions.push(eq(transactions.customerId, customerId));
      }
      if (dateFrom) {
        whereConditions.push(sql`${transactions.createdAt} >= ${dateFrom}`);
      }
      if (dateTo) {
        whereConditions.push(sql`${transactions.createdAt} <= ${dateTo}`);
      }
      
      const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;
      
      // Get transactions with product and customer info
      const transactionsQuery = db
        .select({
          id: transactions.id,
          transactionId: transactions.transactionId,
          productId: transactions.productId,
          quantity: transactions.quantity,
          type: transactions.type,
          customerId: transactions.customerId,
          supplierId: transactions.supplierId,
          unitPrice: transactions.unitPrice,
          discountRate: transactions.discountRate,
          totalAmount: transactions.totalAmount,
          createdAt: transactions.createdAt,
          productName: products.name,
          customerName: sql<string>`COALESCE(customers.name, 'N/A')`,
          supplierName: sql<string>`COALESCE(suppliers.name, 'N/A')`
        })
        .from(transactions)
        .leftJoin(products, eq(transactions.productId, products.productId))
        .leftJoin(customers, eq(transactions.customerId, customers.customerId))
        .leftJoin(suppliers, eq(transactions.supplierId, suppliers.supplierId))
        .limit(limit)
        .offset(offset)
        .orderBy(desc(transactions.createdAt));
      
      const transactionsData = whereClause 
        ? await transactionsQuery.where(whereClause)
        : await transactionsQuery;
      
      // Get total count
      const totalQuery = whereClause 
        ? db.select({ count: count() }).from(transactions).where(whereClause)
        : db.select({ count: count() }).from(transactions);
      
      const [{ count: total }] = await totalQuery;
      
      res.json({
        success: true,
        data: transactionsData,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Transactions fetch error:', error);
      res.status(500).json({
        error: {
          message: "Failed to fetch transactions",
          code: "TRANSACTIONS_FETCH_ERROR"
        }
      });
    }
  });

  app.get('/api/transactions/:id', async (req, res) => {
    try {
      const transactionId = parseInt(req.params.id);
      
      const [transaction] = await db
        .select({
          id: transactions.id,
          transactionId: transactions.transactionId,
          productId: transactions.productId,
          quantity: transactions.quantity,
          type: transactions.type,
          customerId: transactions.customerId,
          supplierId: transactions.supplierId,
          unitPrice: transactions.unitPrice,
          discountRate: transactions.discountRate,
          totalAmount: transactions.totalAmount,
          createdAt: transactions.createdAt,
          productName: products.name,
          customerName: sql<string>`COALESCE(customers.name, 'N/A')`,
          supplierName: sql<string>`COALESCE(suppliers.name, 'N/A')`
        })
        .from(transactions)
        .leftJoin(products, eq(transactions.productId, products.productId))
        .leftJoin(customers, eq(transactions.customerId, customers.customerId))
        .leftJoin(suppliers, eq(transactions.supplierId, suppliers.supplierId))
        .where(eq(transactions.id, transactionId));
      
      if (!transaction) {
        return res.status(404).json({
          error: {
            message: "Transaction not found",
            code: "TRANSACTION_NOT_FOUND"
          }
        });
      }
      
      res.json({
        success: true,
        data: transaction
      });
    } catch (error) {
      console.error('Transaction fetch error:', error);
      res.status(500).json({
        error: {
          message: "Failed to fetch transaction",
          code: "TRANSACTION_FETCH_ERROR"
        }
      });
    }
  });

  app.post('/api/transactions', async (req, res) => {
    try {
      const validatedData = insertTransactionSchema.parse(req.body);
      
      // Get product details for pricing and stock validation
      const [product] = await db.select().from(products).where(eq(products.productId, validatedData.productId));
      
      if (!product) {
        return res.status(404).json({
          error: {
            message: `Product ${validatedData.productId} not found`,
            code: "PRODUCT_NOT_FOUND"
          }
        });
      }
      
      const unitPrice = parseFloat(product.price);
      let discountRate = 0;
      
      // Calculate discount for sales transactions
      if (validatedData.type === 'sale' && validatedData.customerId) {
        // Get customer details
        const [customer] = await db.select().from(customers).where(eq(customers.customerId, validatedData.customerId));
        if (customer) {
          discountRate = await calculateDiscount(validatedData.quantity, customer.category);
        }
      }
      
      const baseAmount = unitPrice * validatedData.quantity;
      const discountAmount = baseAmount * discountRate;
      const totalAmount = baseAmount - discountAmount;
      
      // Validate stock for sales
      if (validatedData.type === 'sale') {
        if (product.stock < validatedData.quantity) {
          return res.status(400).json({
            error: {
              message: `Insufficient stock. Available: ${product.stock}, Requested: ${validatedData.quantity}`,
              code: "INSUFFICIENT_STOCK"
            }
          });
        }
      }
      
      // Create transaction
      const [newTransaction] = await db.insert(transactions).values({
        ...validatedData,
        unitPrice: unitPrice.toString(),
        discountRate: (discountRate * 100).toString(), // Store as percentage
        totalAmount: totalAmount.toString()
      }).returning();
      
      // Update stock
      const stockChange = validatedData.type === 'purchase' ? validatedData.quantity : -validatedData.quantity;
      const newStock = product.stock + stockChange;
      
      await db.update(products)
        .set({ stock: newStock, updatedAt: new Date() })
        .where(eq(products.productId, validatedData.productId));
      
      res.status(201).json({
        success: true,
        data: newTransaction
      });
    } catch (error) {
      console.error('Transaction creation error:', error);
      res.status(400).json({
        error: {
          message: error instanceof Error ? error.message : "Failed to create transaction",
          code: "TRANSACTION_CREATION_ERROR"
        }
      });
    }
  });

  app.put('/api/transactions/:id', async (req, res) => {
    try {
      const transactionId = parseInt(req.params.id);
      const updateData = req.body;
      
      // Get current transaction
      const [currentTransaction] = await db.select().from(transactions).where(eq(transactions.id, transactionId));
      
      if (!currentTransaction) {
        return res.status(404).json({
          error: {
            message: "Transaction not found",
            code: "TRANSACTION_NOT_FOUND"
          }
        });
      }
      
      // Get product details
      const [product] = await db.select().from(products).where(eq(products.productId, currentTransaction.productId));
      
      if (!product) {
        return res.status(404).json({
          error: {
            message: `Product ${currentTransaction.productId} not found`,
            code: "PRODUCT_NOT_FOUND"
          }
        });
      }
      
      // Reverse the old transaction's stock effect
      const oldStockChange = currentTransaction.type === 'purchase' ? -currentTransaction.quantity : currentTransaction.quantity;
      const reversedStock = product.stock + oldStockChange;
      
      // Apply new transaction's stock effect
      const newQuantity = updateData.quantity || currentTransaction.quantity;
      const newType = updateData.type || currentTransaction.type;
      const newStockChange = newType === 'purchase' ? newQuantity : -newQuantity;
      const finalStock = reversedStock + newStockChange;
      
      // Validate final stock
      if (finalStock < 0) {
        return res.status(400).json({
          error: {
            message: `Insufficient stock. Available: ${reversedStock}, Requested: ${Math.abs(newStockChange)}`,
            code: "INSUFFICIENT_STOCK"
          }
        });
      }
      
      // Update transaction
      const unitPrice = parseFloat(product.price);
      const totalAmount = unitPrice * newQuantity;
      
      const [result] = await db.update(transactions)
        .set({
          ...updateData,
          unitPrice: unitPrice.toString(),
          totalAmount: totalAmount.toString()
        })
        .where(eq(transactions.id, transactionId))
        .returning();
      
      // Update product stock
      await db.update(products)
        .set({ stock: finalStock, updatedAt: new Date() })
        .where(eq(products.productId, currentTransaction.productId));
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Transaction update error:', error);
      res.status(400).json({
        error: {
          message: error instanceof Error ? error.message : "Failed to update transaction",
          code: "TRANSACTION_UPDATE_ERROR"
        }
      });
    }
  });

  app.delete('/api/transactions/:id', async (req, res) => {
    try {
      const transactionId = parseInt(req.params.id);
      
      // Get current transaction
      const [currentTransaction] = await db.select().from(transactions).where(eq(transactions.id, transactionId));
      
      if (!currentTransaction) {
        return res.status(404).json({
          error: {
            message: "Transaction not found",
            code: "TRANSACTION_NOT_FOUND"
          }
        });
      }
      
      // Get product details
      const [product] = await db.select().from(products).where(eq(products.productId, currentTransaction.productId));
      
      if (!product) {
        return res.status(404).json({
          error: {
            message: `Product ${currentTransaction.productId} not found`,
            code: "PRODUCT_NOT_FOUND"
          }
        });
      }
      
      // Reverse the transaction's stock effect
      const stockChange = currentTransaction.type === 'purchase' ? -currentTransaction.quantity : currentTransaction.quantity;
      const newStock = product.stock + stockChange;
      
      // Validate final stock
      if (newStock < 0) {
        return res.status(400).json({
          error: {
            message: `Cannot delete transaction. Would result in negative stock: ${newStock}`,
            code: "INSUFFICIENT_STOCK"
          }
        });
      }
      
      // Delete transaction
      await db.delete(transactions).where(eq(transactions.id, transactionId));
      
      // Update product stock
      await db.update(products)
        .set({ stock: newStock, updatedAt: new Date() })
        .where(eq(products.productId, currentTransaction.productId));
      
      res.json({
        success: true,
        message: "Transaction deleted successfully"
      });
    } catch (error) {
      console.error('Transaction deletion error:', error);
      res.status(400).json({
        error: {
          message: error instanceof Error ? error.message : "Failed to delete transaction",
          code: "TRANSACTION_DELETE_ERROR"
        }
      });
    }
  });

  // Customer endpoints
  app.get('/api/customers', async (req, res) => {
    try {
      const customersData = await db.select().from(customers).orderBy(customers.name);
      
      res.json({
        success: true,
        data: customersData
      });
    } catch (error) {
      console.error('Customers fetch error:', error);
      res.status(500).json({
        error: {
          message: "Failed to fetch customers",
          code: "CUSTOMERS_FETCH_ERROR"
        }
      });
    }
  });

  // Reports endpoints
  app.get('/api/reports/dashboard', async (req, res) => {
    try {
      // Get total products count
      const [{ count: totalProducts }] = await db.select({ count: count() }).from(products);
      
      // Get inventory value
      const inventoryResult = await db
        .select({ value: sql<number>`COALESCE(SUM(CAST(price AS numeric) * stock), 0)` })
        .from(products);
      const inventoryValue = Number(inventoryResult[0]?.value || 0);
      
      // Get low stock count
      const [{ count: lowStockCount }] = await db
        .select({ count: count() })
        .from(products)
        .where(sql`stock <= low_stock_threshold`);
      
      // Get total revenue from sales
      const revenueResult = await db
        .select({ revenue: sql<number>`COALESCE(SUM(CAST(total_amount AS numeric)), 0)` })
        .from(transactions)
        .where(eq(transactions.type, 'sale'));
      const totalRevenue = Number(revenueResult[0]?.revenue || 0);

      res.json({
        success: true,
        data: {
          totalProducts,
          inventoryValue: inventoryValue.toFixed(2),
          lowStockCount,
          totalRevenue: totalRevenue.toFixed(2)
        }
      });
    } catch (error) {
      console.error('Dashboard metrics error:', error);
      res.status(500).json({
        error: {
          message: "Failed to fetch dashboard metrics",
          code: "DASHBOARD_METRICS_ERROR"
        }
      });
    }
  });

  app.get('/api/reports/low-stock', async (req, res) => {
    try {
      const threshold = req.query.threshold ? parseInt(req.query.threshold as string) : null;
      
      let lowStockProducts;
      
      if (threshold) {
        lowStockProducts = await db.select().from(products)
          .where(sql`stock <= ${threshold}`)
          .orderBy(products.stock);
      } else {
        lowStockProducts = await db.select().from(products)
          .where(sql`stock <= low_stock_threshold`)
          .orderBy(products.stock);
      }

      res.json({
        success: true,
        data: lowStockProducts
      });
    } catch (error) {
      console.error('Low stock products error:', error);
      res.status(500).json({
        error: {
          message: "Failed to fetch low stock products",
          code: "LOW_STOCK_ERROR"
        }
      });
    }
  });

  app.get('/api/reports/top-selling', async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 5;
      
      const topProducts = await db
        .select({
          productId: products.productId,
          name: products.name,
          category: products.category,
          revenue: sql<number>`SUM(CAST(${transactions.totalAmount} AS numeric))`,
          quantitySold: sql<number>`SUM(CASE WHEN ${transactions.type} = 'sale' THEN ${transactions.quantity} ELSE 0 END)`
        })
        .from(products)
        .leftJoin(transactions, eq(products.productId, transactions.productId))
        .where(eq(transactions.type, 'sale'))
        .groupBy(products.productId, products.name, products.category)
        .orderBy(desc(sql`SUM(CAST(${transactions.totalAmount} AS numeric))`))
        .limit(limit)
        .execute();

      const formattedProducts = topProducts.map((product, index) => ({
        rank: index + 1,
        productId: product.productId,
        name: product.name,
        category: product.category,
        revenue: parseFloat(product.revenue?.toString() || '0'),
        quantitySold: parseInt(product.quantitySold?.toString() || '0'),
        sku: product.productId
      }));

      res.json({
        success: true,
        data: formattedProducts
      });
    } catch (error) {
      console.error('Top selling products error:', error);
      res.status(500).json({
        error: {
          message: "Failed to fetch top selling products",
          code: "TOP_SELLING_ERROR"
        }
      });
    }
  });

  app.get('/api/reports/monthly-sales', async (req, res) => {
    try {
      const months = parseInt(req.query.months as string) || 12;
      
      const salesData = await db
        .select({
          month: sql<string>`TO_CHAR(created_at, 'YYYY-MM')`,
          revenue: sql<number>`SUM(CAST(total_amount AS numeric))`,
          sales: sql<number>`SUM(quantity)`
        })
        .from(transactions)
        .where(
          and(
            eq(transactions.type, 'sale'),
            sql`created_at >= NOW() - INTERVAL '${sql.raw(months.toString())} months'`
          )
        )
        .groupBy(sql`TO_CHAR(created_at, 'YYYY-MM')`)
        .orderBy(sql`TO_CHAR(created_at, 'YYYY-MM')`)
        .execute();

      const formattedData = salesData.map(row => ({
        month: row.month,
        sales: parseInt(row.sales?.toString() || '0'),
        revenue: parseFloat(row.revenue?.toString() || '0')
      }));

      res.json({
        success: true,
        data: formattedData
      });
    } catch (error) {
      console.error('Monthly sales data error:', error);
      res.status(500).json({
        error: {
          message: "Failed to fetch monthly sales data",
          code: "MONTHLY_SALES_ERROR"
        }
      });
    }
  });

  app.get('/api/reports/category-sales', async (req, res) => {
    try {
      const categoryData = await db
        .select({
          category: products.category,
          revenue: sql<number>`SUM(CAST(${transactions.totalAmount} AS numeric))`,
          sales: sql<number>`SUM(${transactions.quantity})`
        })
        .from(transactions)
        .innerJoin(products, eq(transactions.productId, products.productId))
        .where(eq(transactions.type, 'sale'))
        .groupBy(products.category)
        .orderBy(desc(sql`SUM(CAST(${transactions.totalAmount} AS numeric))`))
        .execute();

      // Calculate total revenue for percentage calculation
      const totalRevenue = categoryData.reduce((sum, row) => sum + parseFloat(row.revenue?.toString() || '0'), 0);

      const formattedData = categoryData.map(row => ({
        category: row.category,
        sales: parseInt(row.sales?.toString() || '0'),
        revenue: parseFloat(row.revenue?.toString() || '0'),
        percentage: totalRevenue > 0 ? ((parseFloat(row.revenue?.toString() || '0') / totalRevenue) * 100).toFixed(1) : '0'
      }));

      res.json({
        success: true,
        data: formattedData
      });
    } catch (error) {
      console.error('Category sales data error:', error);
      res.status(500).json({
        error: {
          message: "Failed to fetch category sales data",
          code: "CATEGORY_SALES_ERROR"
        }
      });
    }
  });

  // Supplier endpoints
  app.get('/api/suppliers', async (req, res) => {
    try {
      const suppliersData = await db.select().from(suppliers).orderBy(suppliers.name);
      
      res.json({
        success: true,
        data: suppliersData
      });
    } catch (error) {
      console.error('Suppliers fetch error:', error);
      res.status(500).json({
        error: {
          message: "Failed to fetch suppliers",
          code: "SUPPLIERS_FETCH_ERROR"
        }
      });
    }
  });

  app.post('/api/suppliers', async (req, res) => {
    try {
      const validatedData = insertSupplierSchema.parse(req.body);
      const [newSupplier] = await db.insert(suppliers).values(validatedData).returning();
      
      res.status(201).json({
        success: true,
        data: newSupplier
      });
    } catch (error) {
      console.error('Supplier creation error:', error);
      res.status(400).json({
        error: {
          message: "Failed to create supplier",
          code: "SUPPLIER_CREATION_ERROR"
        }
      });
    }
  });

  app.put('/api/suppliers/:id', async (req, res) => {
    try {
      const supplierId = parseInt(req.params.id);
      const updateData = req.body;
      
      const [updatedSupplier] = await db
        .update(suppliers)
        .set(updateData)
        .where(eq(suppliers.id, supplierId))
        .returning();

      if (!updatedSupplier) {
        return res.status(404).json({
          error: {
            message: "Supplier not found",
            code: "SUPPLIER_NOT_FOUND"
          }
        });
      }

      res.json({
        success: true,
        data: updatedSupplier
      });
    } catch (error) {
      console.error('Supplier update error:', error);
      res.status(500).json({
        error: {
          message: error instanceof Error ? error.message : "Failed to update supplier",
          code: "SUPPLIER_UPDATE_ERROR"
        }
      });
    }
  });

  app.delete('/api/suppliers/:id', async (req, res) => {
    try {
      const supplierId = parseInt(req.params.id);
      
      const [deletedSupplier] = await db
        .delete(suppliers)
        .where(eq(suppliers.id, supplierId))
        .returning();

      if (!deletedSupplier) {
        return res.status(404).json({
          error: {
            message: "Supplier not found",
            code: "SUPPLIER_NOT_FOUND"
          }
        });
      }

      res.json({
        success: true,
        message: "Supplier deleted successfully"
      });
    } catch (error) {
      console.error('Supplier deletion error:', error);
      res.status(500).json({
        error: {
          message: error instanceof Error ? error.message : "Failed to delete supplier",
          code: "SUPPLIER_DELETE_ERROR"
        }
      });
    }
  });

  // Enhanced customer endpoints
  app.post('/api/customers', async (req, res) => {
    try {
      const validatedData = insertCustomerSchema.parse(req.body);
      const [newCustomer] = await db.insert(customers).values(validatedData).returning();
      
      res.status(201).json({
        success: true,
        data: newCustomer
      });
    } catch (error) {
      console.error('Customer creation error:', error);
      res.status(400).json({
        error: {
          message: "Failed to create customer",
          code: "CUSTOMER_CREATION_ERROR"
        }
      });
    }
  });

  app.put('/api/customers/:id', async (req, res) => {
    try {
      const customerId = parseInt(req.params.id);
      const updateData = req.body;
      
      const [updatedCustomer] = await db
        .update(customers)
        .set(updateData)
        .where(eq(customers.id, customerId))
        .returning();

      if (!updatedCustomer) {
        return res.status(404).json({
          error: {
            message: "Customer not found",
            code: "CUSTOMER_NOT_FOUND"
          }
        });
      }

      res.json({
        success: true,
        data: updatedCustomer
      });
    } catch (error) {
      console.error('Customer update error:', error);
      res.status(500).json({
        error: {
          message: error instanceof Error ? error.message : "Failed to update customer",
          code: "CUSTOMER_UPDATE_ERROR"
        }
      });
    }
  });

  app.delete('/api/customers/:id', async (req, res) => {
    try {
      const customerId = parseInt(req.params.id);
      
      const [deletedCustomer] = await db
        .delete(customers)
        .where(eq(customers.id, customerId))
        .returning();

      if (!deletedCustomer) {
        return res.status(404).json({
          error: {
            message: "Customer not found",
            code: "CUSTOMER_NOT_FOUND"
          }
        });
      }

      res.json({
        success: true,
        message: "Customer deleted successfully"
      });
    } catch (error) {
      console.error('Customer deletion error:', error);
      res.status(500).json({
        error: {
          message: error instanceof Error ? error.message : "Failed to delete customer",
          code: "CUSTOMER_DELETE_ERROR"
        }
      });
    }
  });

  // Discount calculation endpoint
  app.get('/api/discount-preview', async (req, res) => {
    try {
      const quantity = parseInt(req.query.quantity as string) || 0;
      const customerCategory = req.query.category as string || 'regular';
      
      const discountRate = await calculateDiscount(quantity, customerCategory);
      
      res.json({
        success: true,
        data: {
          discountRate,
          quantity,
          customerCategory
        }
      });
    } catch (error) {
      console.error('Discount calculation error:', error);
      res.status(500).json({
        error: {
          message: "Failed to calculate discount",
          code: "DISCOUNT_CALCULATION_ERROR"
        }
      });
    }
  });

  // Helper function to calculate discount
  async function calculateDiscount(quantity: number, customerCategory: string): Promise<number> {
    const rules = await db.select().from(discountRules).where(eq(discountRules.isActive, true));
    
    let bestDiscount = 0;
    
    for (const rule of rules) {
      if (rule.type === 'quantity' && quantity >= rule.threshold) {
        bestDiscount = Math.max(bestDiscount, parseFloat(rule.percent));
      } else if (rule.type === 'customer_category' && rule.categoryTarget === customerCategory) {
        bestDiscount = Math.max(bestDiscount, parseFloat(rule.percent));
      }
    }
    
    return bestDiscount / 100; // Convert percentage to decimal
  }

  const httpServer = createServer(app);
  return httpServer;
}
