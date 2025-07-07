import 'dotenv/config';
import http from 'http';
import { URL } from 'url';
import pkg from 'pg';
const { Pool } = pkg;
import { InventoryManager } from './InventoryManager.js';
import { AppError } from './AppError.js';

/**
 * Pure Node.js HTTP Server for Inventory Management API
 * Implements RESTful endpoints using only built-in modules
 * Provides comprehensive error handling and request validation
 */

// Database configuration for PostgreSQL
const DB_CONFIG = {
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

let dbPool;
let inventoryManager;

/**
 * Initialize database connection and inventory manager
 */
async function initializeDatabase() {
  try {
    dbPool = new Pool(DB_CONFIG);
    inventoryManager = new InventoryManager(dbPool);
    
    // Set up low stock notification listener
    inventoryManager.on('lowStock', (data) => {
      console.log(`🚨 LOW STOCK ALERT: ${data.name} (${data.productId}) - Current: ${data.currentStock}, Threshold: ${data.threshold}`);
      // Here you could implement additional notification logic (email, SMS, etc.)
    });

    console.log('✅ Database connection established');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
}

/**
 * Parse JSON request body
 */
function parseRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        if (body) {
          resolve(JSON.parse(body));
        } else {
          resolve({});
        }
      } catch (error) {
        reject(new AppError('Invalid JSON in request body', 400));
      }
    });
    req.on('error', reject);
  });
}

/**
 * Parse URL query parameters
 */
function parseQueryParams(url) {
  const urlObj = new URL(url, `http://localhost:8000`);
  const params = {};
  urlObj.searchParams.forEach((value, key) => {
    params[key] = value;
  });
  return params;
}

/**
 * Send JSON response
 */
function sendResponse(res, data, statusCode = 200) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  });
  res.end(JSON.stringify(data));
}

/**
 * Send error response
 */
function sendError(res, error) {
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';
  
  console.error(`❌ Error ${statusCode}: ${message}`);
  
  sendResponse(res, {
    error: {
      message,
      code: error.code || 'INTERNAL_ERROR',
      statusCode
    }
  }, statusCode);
}

/**
 * Handle CORS preflight requests
 */
function handleOptions(res) {
  res.writeHead(200, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  });
  res.end();
}

/**
 * Route handlers for different endpoints
 */
const routes = {
  // POST /products - Add a new product
  'POST /products': async (req, res, body) => {
    const { productId, name, price, stock, category } = body;
    const product = await inventoryManager.addProduct(productId, name, parseFloat(price), parseInt(stock), category);
    sendResponse(res, { success: true, data: product }, 201);
  },

  // GET /products - List products with pagination and filters
  'GET /products': async (req, res, body, query) => {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 20;
    const offset = (page - 1) * limit;
    const category = query.category;

    let products;
    if (category) {
      products = await inventoryManager.getProductsByCategory(category, limit, offset);
    } else {
      const results = await dbPool.query(
        'SELECT * FROM products ORDER BY name LIMIT $1 OFFSET $2',
        [limit, offset]
      );
      products = results.rows;
    }

    // Get total count for pagination
    const countQuery = category 
      ? 'SELECT COUNT(*) as total FROM products WHERE category = $1'
      : 'SELECT COUNT(*) as total FROM products';
    const countParams = category ? [category] : [];
    const countResult = await dbPool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].total);

    sendResponse(res, {
      success: true,
      data: products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  },

  // PUT /products/:id - Update an existing product
  'PUT /products': async (req, res, body, query, pathSegments) => {
    const productId = pathSegments[2]; // /products/:id
    if (!productId) {
      throw AppError.validation('Product ID is required');
    }

    const updates = [];
    const values = [];
    
    // Build dynamic update query based on provided fields
    let paramIndex = 1;
    if (body.name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      values.push(body.name);
    }
    if (body.price !== undefined) {
      updates.push(`price = $${paramIndex++}`);
      values.push(parseFloat(body.price));
    }
    if (body.stock !== undefined) {
      updates.push(`stock = $${paramIndex++}`);
      values.push(parseInt(body.stock));
    }
    if (body.category !== undefined) {
      updates.push(`category = $${paramIndex++}`);
      values.push(body.category);
    }
    
    if (updates.length === 0) {
      throw AppError.validation('No valid fields to update');
    }

    updates.push(`updated_at = NOW()`);
    values.push(productId);

    await dbPool.query(
      `UPDATE products SET ${updates.join(', ')} WHERE product_id = $${paramIndex}`,
      values
    );

    // Return updated product
    const updated = await dbPool.query(
      'SELECT * FROM products WHERE product_id = $1',
      [productId]
    );

    if (updated.rows.length === 0) {
      throw AppError.notFound(`Product ${productId} not found`);
    }

    sendResponse(res, { success: true, data: updated.rows[0] });
  },

  // POST /transactions - Create a new transaction
  'POST /transactions': async (req, res, body) => {
    const { transactionId, productId, quantity, type, customerId } = body;
    const transaction = await inventoryManager.createTransaction(
      transactionId, 
      productId, 
      parseInt(quantity), 
      type, 
      customerId
    );
    sendResponse(res, { success: true, data: transaction }, 201);
  },

  // GET /reports/inventory - Get total inventory value
  'GET /reports/inventory': async (req, res) => {
    const value = await inventoryManager.getInventoryValue();
    sendResponse(res, { 
      success: true, 
      data: { totalValue: value.toFixed(2) } 
    });
  },

  // GET /reports/low-stock - Get low stock products
  'GET /reports/low-stock': async (req, res, body, query) => {
    const threshold = query.threshold ? parseInt(query.threshold) : null;
    const products = await inventoryManager.getLowStockProducts(threshold);
    sendResponse(res, { success: true, data: products });
  },

  // GET /reports/top-selling - Get top selling products
  'GET /reports/top-selling': async (req, res, body, query) => {
    const limit = parseInt(query.limit) || 10;
    const products = await inventoryManager.getTopSellingProducts(limit);
    sendResponse(res, { success: true, data: products });
  },

  // GET /reports/dashboard - Get dashboard metrics
  'GET /reports/dashboard': async (req, res) => {
    const metrics = await inventoryManager.getDashboardMetrics();
    sendResponse(res, { success: true, data: metrics });
  },

  // GET /reports/monthly-sales - Get monthly sales data
  'GET /reports/monthly-sales': async (req, res, body, query) => {
    const months = parseInt(query.months) || 12;
    const data = await inventoryManager.getMonthlySalesData(months);
    sendResponse(res, { success: true, data });
  },

  // GET /reports/category-sales - Get category sales data
  'GET /reports/category-sales': async (req, res) => {
    const data = await inventoryManager.getCategorySalesData();
    sendResponse(res, { success: true, data });
  },

  // GET /products/:id/history - Get product transaction history
  'GET /products/history': async (req, res, body, query, pathSegments) => {
    const productId = pathSegments[2]; // /products/:id/history
    if (!productId) {
      throw AppError.validation('Product ID is required');
    }

    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 20;
    const offset = (page - 1) * limit;

    const history = await inventoryManager.getProductHistory(productId, limit, offset);
    sendResponse(res, { success: true, data: history });
  }
};

/**
 * Main request handler
 */
async function handleRequest(req, res) {
  try {
    const url = req.url;
    const method = req.method;

    // Handle CORS preflight
    if (method === 'OPTIONS') {
      handleOptions(res);
      return;
    }

    // Parse URL and extract path segments
    const urlObj = new URL(url, `http://localhost:8000`);
    const pathname = urlObj.pathname;
    const pathSegments = pathname.split('/').filter(segment => segment);
    const query = parseQueryParams(url);

    // Parse request body for POST/PUT requests
    const body = ['POST', 'PUT'].includes(method) ? await parseRequestBody(req) : {};

    // Build route key
    let routeKey = `${method} /${pathSegments[0]}`;
    
    // Handle special routes with parameters
    if (pathSegments[0] === 'products' && pathSegments[2] === 'history') {
      routeKey = 'GET /products/history';
    } else if (pathSegments[0] === 'products' && pathSegments[1] && method === 'PUT') {
      routeKey = 'PUT /products';
    }

    // Find and execute route handler
    const handler = routes[routeKey];
    if (handler) {
      await handler(req, res, body, query, pathSegments);
    } else {
      sendError(res, AppError.notFound(`Route ${method} ${pathname} not found`));
    }

  } catch (error) {
    sendError(res, error);
  }
}

/**
 * Start the server
 */
async function startServer() {
  await initializeDatabase();

  const server = http.createServer(handleRequest);
  const PORT = process.env.PORT || 8000;
  
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Inventory Management API Server running on http://0.0.0.0:${PORT}`);
    console.log('📚 Available endpoints:');
    console.log('  POST   /products           - Add new product');
    console.log('  GET    /products           - List products (with pagination)');
    console.log('  PUT    /products/:id       - Update product');
    console.log('  POST   /transactions       - Create transaction');
    console.log('  GET    /reports/inventory  - Get inventory value');
    console.log('  GET    /reports/low-stock  - Get low stock products');
    console.log('  GET    /reports/top-selling - Get top selling products');
    console.log('  GET    /reports/dashboard  - Get dashboard metrics');
    console.log('  GET    /reports/monthly-sales - Get monthly sales data');
    console.log('  GET    /reports/category-sales - Get category sales data');
    console.log('  GET    /products/:id/history - Get product history');
  });

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    console.log('🛑 Received SIGTERM, shutting down gracefully...');
    server.close(async () => {
      if (dbPool) {
        await dbPool.end();
      }
      process.exit(0);
    });
  });
}

// Start the server
startServer().catch(error => {
  console.error('💥 Failed to start server:', error.message);
  process.exit(1);
});
