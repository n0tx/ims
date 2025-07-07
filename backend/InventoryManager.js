import { EventEmitter } from 'events';
import { AppError } from './AppError.js';

/**
 * InventoryManager - Core business logic class for inventory operations
 * Handles product management, stock updates, transactions, and reporting
 * Emits real-time notifications for low stock alerts
 */
export class InventoryManager extends EventEmitter {
  constructor(dbConnection) {
    super();
    this.db = dbConnection;
    this.lowStockThreshold = 10; // Default threshold
  }

  /**
   * Add a new product to inventory
   * @param {string} productId - Unique product identifier
   * @param {string} name - Product name
   * @param {number} price - Product price
   * @param {number} stock - Initial stock quantity
   * @param {string} category - Product category
   * @returns {Promise<Object>} Created product
   */
  async addProduct(productId, name, price, stock, category) {
    // Input validation
    if (!productId || !name || !category) {
      throw AppError.validation('Product ID, name, and category are required');
    }
    
    if (price < 0) {
      throw AppError.validation('Price cannot be negative');
    }
    
    if (stock < 0) {
      throw AppError.validation('Stock cannot be negative');
    }

    try {
      // Check if product already exists
      const existing = await this.db.query(
        'SELECT id FROM products WHERE product_id = $1',
        [productId]
      );
      
      if (existing.rows.length > 0) {
        throw AppError.conflict(`Product with ID ${productId} already exists`);
      }

      // Insert new product
      const result = await this.db.query(
        `INSERT INTO products (product_id, name, price, stock, category, low_stock_threshold, created_at, updated_at) 
         VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW()) RETURNING *`,
        [productId, name, price, stock, category, this.lowStockThreshold]
      );

      // Return the created product
      const product = result.rows[0];

      return product;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw AppError.internal('Failed to add product: ' + error.message);
    }
  }

  /**
   * Update stock quantity for a product
   * @param {string} productId - Product identifier
   * @param {number} quantity - Quantity to add/subtract
   * @param {string} transactionType - "purchase" or "sale"
   * @returns {Promise<Object>} Updated product
   */
  async updateStock(productId, quantity, transactionType) {
    // Input validation
    if (!productId || quantity === undefined || !transactionType) {
      throw AppError.validation('Product ID, quantity, and transaction type are required');
    }

    if (!['purchase', 'sale'].includes(transactionType)) {
      throw AppError.validation('Transaction type must be "purchase" or "sale"');
    }

    if (quantity <= 0) {
      throw AppError.validation('Quantity must be positive');
    }

    try {
      // Get current product
      const products = await this.db.query(
        'SELECT * FROM products WHERE product_id = $1',
        [productId]
      );

      if (products.rows.length === 0) {
        throw AppError.notFound(`Product ${productId} not found`);
      }

      const product = products.rows[0];
      let newStock;

      if (transactionType === 'purchase') {
        newStock = product.stock + quantity;
      } else { // sale
        newStock = product.stock - quantity;
        if (newStock < 0) {
          throw AppError.validation('Insufficient stock for sale transaction');
        }
      }

      // Update stock
      await this.db.query(
        'UPDATE products SET stock = $1, updated_at = NOW() WHERE product_id = $2',
        [newStock, productId]
      );

      // Check for low stock and emit notification
      if (newStock <= product.low_stock_threshold) {
        this.emit('lowStock', {
          productId,
          name: product.name,
          currentStock: newStock,
          threshold: product.low_stock_threshold,
          timestamp: new Date().toISOString()
        });
      }

      // Return updated product
      const updatedProduct = await this.db.query(
        'SELECT * FROM products WHERE product_id = $1',
        [productId]
      );

      return updatedProduct.rows[0];
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw AppError.internal('Failed to update stock: ' + error.message);
    }
  }

  /**
   * Create a new transaction record
   * @param {string} transactionId - Unique transaction identifier
   * @param {string} productId - Product identifier
   * @param {number} quantity - Transaction quantity
   * @param {string} type - "purchase" or "sale"
   * @param {string} customerId - Customer identifier (optional for purchases)
   * @returns {Promise<Object>} Created transaction
   */
  async createTransaction(transactionId, productId, quantity, type, customerId = null) {
    // Input validation
    if (!transactionId || !productId || !quantity || !type) {
      throw AppError.validation('Transaction ID, product ID, quantity, and type are required');
    }

    if (!['purchase', 'sale'].includes(type)) {
      throw AppError.validation('Type must be "purchase" or "sale"');
    }

    if (quantity <= 0) {
      throw AppError.validation('Quantity must be positive');
    }

    try {
      // Check if transaction ID already exists
      const existing = await this.db.query(
        'SELECT id FROM transactions WHERE transaction_id = $1',
        [transactionId]
      );
      
      if (existing.rows.length > 0) {
        throw AppError.conflict(`Transaction with ID ${transactionId} already exists`);
      }

      // Get product details for pricing
      const products = await this.db.query(
        'SELECT * FROM products WHERE product_id = $1',
        [productId]
      );

      if (products.rows.length === 0) {
        throw AppError.notFound(`Product ${productId} not found`);
      }

      const product = products.rows[0];
      const unitPrice = parseFloat(product.price);
      const totalAmount = unitPrice * quantity;

      // Start transaction
      await this.db.query('BEGIN');

      try {
        // Create transaction record
        const result = await this.db.query(
          `INSERT INTO transactions (transaction_id, product_id, quantity, type, customer_id, unit_price, total_amount, created_at) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, NOW()) RETURNING *`,
          [transactionId, productId, quantity, type, customerId, unitPrice, totalAmount]
        );

        // Update stock
        await this.updateStock(productId, quantity, type);

        // Commit transaction
        await this.db.query('COMMIT');

        // Return created transaction
        return result.rows[0];
      } catch (error) {
        await this.db.query('ROLLBACK');
        throw error;
      }
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw AppError.internal('Failed to create transaction: ' + error.message);
    }
  }

  /**
   * Get products by category with optional pagination
   * @param {string} category - Product category
   * @param {number} limit - Results limit
   * @param {number} offset - Results offset
   * @returns {Promise<Array>} Products in category
   */
  async getProductsByCategory(category, limit = 50, offset = 0) {
    if (!category) {
      throw AppError.validation('Category is required');
    }

    try {
      const products = await this.db.query(
        'SELECT * FROM products WHERE category = $1 ORDER BY name LIMIT $2 OFFSET $3',
        [category, limit, offset]
      );

      return products.rows;
    } catch (error) {
      throw AppError.internal('Failed to get products by category: ' + error.message);
    }
  }

  /**
   * Calculate total inventory value
   * @returns {Promise<number>} Total inventory value
   */
  async getInventoryValue() {
    try {
      const result = await this.db.query(
        'SELECT SUM(price * stock) as total_value FROM products'
      );

      return parseFloat(result.rows[0].total_value) || 0;
    } catch (error) {
      throw AppError.internal('Failed to calculate inventory value: ' + error.message);
    }
  }

  /**
   * Get transaction history for a specific product
   * @param {string} productId - Product identifier
   * @param {number} limit - Results limit
   * @param {number} offset - Results offset
   * @returns {Promise<Array>} Transaction history
   */
  async getProductHistory(productId, limit = 50, offset = 0) {
    if (!productId) {
      throw AppError.validation('Product ID is required');
    }

    try {
      const transactions = await this.db.query(
        `SELECT t.*, p.name as product_name 
         FROM transactions t 
         JOIN products p ON t.product_id = p.product_id 
         WHERE t.product_id = $1 
         ORDER BY t.created_at DESC 
         LIMIT $2 OFFSET $3`,
        [productId, limit, offset]
      );

      return transactions.rows;
    } catch (error) {
      throw AppError.internal('Failed to get product history: ' + error.message);
    }
  }

  /**
   * Get top selling products by revenue
   * @param {number} limit - Number of top products to return
   * @returns {Promise<Array>} Top selling products
   */
  async getTopSellingProducts(limit = 10) {
    try {
      const results = await this.db.query(
        `SELECT 
           p.product_id,
           p.name,
           p.category,
           SUM(t.total_amount) as revenue,
           SUM(CASE WHEN t.type = 'sale' THEN t.quantity ELSE 0 END) as quantity_sold
         FROM products p
         LEFT JOIN transactions t ON p.product_id = t.product_id
         WHERE t.type = 'sale'
         GROUP BY p.product_id, p.name, p.category
         ORDER BY revenue DESC
         LIMIT $1`,
        [limit]
      );

      return results.rows.map((product, index) => ({
        rank: index + 1,
        productId: product.product_id,
        name: product.name,
        category: product.category,
        revenue: parseFloat(product.revenue) || 0,
        quantitySold: parseInt(product.quantity_sold) || 0,
        sku: product.product_id // Using productId as SKU for display
      }));
    } catch (error) {
      throw AppError.internal('Failed to get top selling products: ' + error.message);
    }
  }

  /**
   * Get products with stock below threshold
   * @param {number} threshold - Custom threshold (optional)
   * @returns {Promise<Array>} Low stock products
   */
  async getLowStockProducts(threshold = null) {
    try {
      const query = threshold 
        ? 'SELECT * FROM products WHERE stock <= $1 ORDER BY stock ASC'
        : 'SELECT * FROM products WHERE stock <= low_stock_threshold ORDER BY stock ASC';
      
      const params = threshold ? [threshold] : [];
      const products = await this.db.query(query, params);

      return products.rows;
    } catch (error) {
      throw AppError.internal('Failed to get low stock products: ' + error.message);
    }
  }

  /**
   * Get dashboard metrics
   * @returns {Promise<Object>} Dashboard metrics
   */
  async getDashboardMetrics() {
    try {
      // Get total products
      const productCount = await this.db.query(
        'SELECT COUNT(*) as count FROM products'
      );

      // Get inventory value
      const inventoryValue = await this.getInventoryValue();

      // Get low stock count
      const lowStockCount = await this.db.query(
        'SELECT COUNT(*) as count FROM products WHERE stock <= low_stock_threshold'
      );

      // Get total revenue (from sales)
      const revenueResult = await this.db.query(
        'SELECT SUM(total_amount) as revenue FROM transactions WHERE type = \'sale\''
      );

      return {
        totalProducts: parseInt(productCount.rows[0].count),
        inventoryValue: inventoryValue.toFixed(2),
        lowStockCount: parseInt(lowStockCount.rows[0].count),
        totalRevenue: (parseFloat(revenueResult.rows[0].revenue) || 0).toFixed(2)
      };
    } catch (error) {
      throw AppError.internal('Failed to get dashboard metrics: ' + error.message);
    }
  }

  /**
   * Get monthly sales data for charts
   * @param {number} months - Number of months to include
   * @returns {Promise<Array>} Monthly sales data
   */
  async getMonthlySalesData(months = 12) {
    try {
      const results = await this.db.query(
        `SELECT 
           TO_CHAR(created_at, 'YYYY-MM') as month,
           SUM(total_amount) as revenue,
           SUM(quantity) as sales
         FROM transactions 
         WHERE type = 'sale' 
           AND created_at >= NOW() - INTERVAL '$1 months'
         GROUP BY TO_CHAR(created_at, 'YYYY-MM')
         ORDER BY month ASC`,
        [months]
      );

      return results.rows.map(row => ({
        month: row.month,
        sales: parseInt(row.sales) || 0,
        revenue: parseFloat(row.revenue) || 0
      }));
    } catch (error) {
      throw AppError.internal('Failed to get monthly sales data: ' + error.message);
    }
  }

  /**
   * Get sales data by category
   * @returns {Promise<Array>} Category sales data
   */
  async getCategorySalesData() {
    try {
      const results = await this.db.query(
        `SELECT 
           p.category,
           SUM(t.total_amount) as revenue,
           SUM(t.quantity) as sales
         FROM transactions t
         JOIN products p ON t.product_id = p.product_id
         WHERE t.type = 'sale'
         GROUP BY p.category
         ORDER BY revenue DESC`
      );

      const totalRevenue = results.rows.reduce((sum, row) => sum + parseFloat(row.revenue), 0);

      return results.rows.map(row => ({
        category: row.category,
        sales: parseInt(row.sales) || 0,
        revenue: parseFloat(row.revenue) || 0,
        percentage: totalRevenue > 0 ? ((parseFloat(row.revenue) / totalRevenue) * 100).toFixed(1) : 0
      }));
    } catch (error) {
      throw AppError.internal('Failed to get category sales data: ' + error.message);
    }
  }
}
