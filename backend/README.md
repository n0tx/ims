# Inventory Management System - Backend

A pure Node.js HTTP server implementing a comprehensive inventory management system with MySQL database integration.

## Features

- **Pure Node.js** - Built using only Node.js built-in modules (no Express)
- **MySQL Database** - Persistent data storage with proper relationships
- **Docker Integration** - Easy setup with Docker Compose
- **Comprehensive API** - Full CRUD operations and reporting endpoints
- **Real-time Notifications** - Low stock alerts via EventEmitter
- **Input Validation** - Comprehensive request validation and error handling
- **Transaction Support** - Database transactions for data consistency
- **Pagination** - Built-in pagination for large datasets

## Quick Start

### Prerequisites

- Node.js 18+ 
- Docker and Docker Compose

### Setup Instructions

1. **Start the Database**
   ```bash
   cd backend
   docker-compose up -d
   ```

2. **Wait for Database Initialization**
   ```bash
   # Check if database is ready
   docker-compose logs mysql
   ```

3. **Install Dependencies**
   ```bash
   npm install
   ```

4. **Start the Server**
   ```bash
   npm start
   ```

   For development with auto-restart:
   ```bash
   npm run dev
   ```

5. **Verify Setup**
   ```bash
   curl http://localhost:8000/reports/dashboard
   ```

## API Endpoints

### Products

#### Add Product
```bash
curl -X POST http://localhost:8000/products \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "LAPTOP-001",
    "name": "Gaming Laptop",
    "price": 1299.99,
    "stock": 15,
    "category": "Electronics"
  }'
