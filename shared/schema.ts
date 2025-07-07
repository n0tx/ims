import { pgTable, text, serial, integer, boolean, decimal, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  productId: text("product_id").notNull().unique(),
  name: text("name").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  stock: integer("stock").notNull().default(0),
  category: text("category").notNull(),
  lowStockThreshold: integer("low_stock_threshold").notNull().default(10),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  transactionId: text("transaction_id").notNull().unique(),
  productId: text("product_id").notNull().references(() => products.productId),
  quantity: integer("quantity").notNull(),
  type: text("type").notNull(), // "purchase" or "sale"
  customerId: text("customer_id").references(() => customers.customerId),
  supplierId: text("supplier_id").references(() => suppliers.supplierId),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  discountRate: decimal("discount_rate", { precision: 5, scale: 2 }).notNull().default("0.00"),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  customerId: text("customer_id").notNull().unique(),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  category: text("category").notNull().default("regular"), // regular, premium, vip
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const suppliers = pgTable("suppliers", {
  id: serial("id").primaryKey(),
  supplierId: text("supplier_id").notNull().unique(),
  name: text("name").notNull(),
  address: text("address"),
  contact: text("contact"),
  paymentTerms: text("payment_terms"), // e.g., "Net 30", "COD", etc.
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const discountRules = pgTable("discount_rules", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // "quantity" or "customer_category"
  threshold: integer("threshold").notNull(), // minimum quantity or category match
  percent: decimal("percent", { precision: 5, scale: 2 }).notNull(), // discount percentage
  categoryTarget: text("category_target"), // for customer_category type
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Define relations between tables
export const productsRelations = relations(products, ({ many }) => ({
  transactions: many(transactions),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  product: one(products, {
    fields: [transactions.productId],
    references: [products.productId],
  }),
  customer: one(customers, {
    fields: [transactions.customerId],
    references: [customers.customerId],
  }),
  supplier: one(suppliers, {
    fields: [transactions.supplierId],
    references: [suppliers.supplierId],
  }),
}));

export const customersRelations = relations(customers, ({ many }) => ({
  transactions: many(transactions),
}));

export const suppliersRelations = relations(suppliers, ({ many }) => ({
  transactions: many(transactions),
}));

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  price: z.coerce.string(),
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
  unitPrice: true,
  totalAmount: true,
});

export const insertCustomerSchema = createInsertSchema(customers).omit({
  id: true,
  createdAt: true,
});

export const insertSupplierSchema = createInsertSchema(suppliers).omit({
  id: true,
  createdAt: true,
});

export const insertDiscountRuleSchema = createInsertSchema(discountRules).omit({
  id: true,
  createdAt: true,
}).extend({
  percent: z.coerce.string(),
});

export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type Customer = typeof customers.$inferSelect;
export type InsertSupplier = z.infer<typeof insertSupplierSchema>;
export type Supplier = typeof suppliers.$inferSelect;
export type InsertDiscountRule = z.infer<typeof insertDiscountRuleSchema>;
export type DiscountRule = typeof discountRules.$inferSelect;

// Dashboard-specific types
export type DashboardMetrics = {
  totalProducts: number;
  inventoryValue: string;
  lowStockCount: number;
  totalRevenue: string;
};

export type MonthlySalesData = {
  month: string;
  sales: number;
  revenue: number;
};

export type CategorySalesData = {
  category: string;
  sales: number;
  revenue: number;
  percentage: number;
};

export type TopProduct = {
  rank: number;
  productId: string;
  name: string;
  category: string;
  revenue: number;
  quantitySold: number;
  sku: string;
};
