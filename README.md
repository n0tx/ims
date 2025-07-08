# Inventory Management System

## Overview

![image](https://github.com/user-attachments/assets/ab3b7b8b-90db-4ec8-a5ff-3c7915595d26)

#

> **This is a comprehensive full-stack inventory management system built with a pure Node.js backend (no Express) and a modern React frontend. The application provides complete CRUD operations for suppliers, customers, products, real-time inventory tracking, transaction management and comprehensive reporting capabilities.**

#

### Database Setup


## Installation & Setup

### Prerequisites
- Node.js **≥ 18**
- PostgreSQL **≥ 13**
- npm or yarn

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/n0tx/ims.git
   cd ims
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Database Setup**
   - Create a PostgreSQL database named `inventory_db`
   - Run the SQL schema:
   ```bash
   psql -h localhost -U <pguser> inventory_db < schema_and_seed.sql
   ```

4. **Environment Configuration**
   Create a `.env` file in the backend directory:
   ```env
   PGHOST=localhost
   PGPORT=5432
   PGUSER=<pguser>
   PGPASSWORD=<pgpassword>
   PGDATABASE=inventory_db
   PORT=8000
   ```

5. **Start the backend server**
   ```bash
   node server.js
   ```

### Frontend Setup

1. **Install frontend dependencies**
   ```bash
   cd .. # Go back to ims root directory
   npm install
   ```

2. **Environment Configuration**
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL=postgres://<pguser>:<pgpassword>@localhost:5432/inventory_db
   ```

3. **Start the frontend development server**
   ```bash
   npm run dev
   ```

The application will be available at:
- Frontend: `http://localhost:5000`
- Backend API: `http://localhost:8000`

## Available Menus

### Sidebar Navigation Structure
- **Dashboard** (`/`) - Overview metrics, charts, and KPIs
- **Products** (`/products`) - Product inventory management
- **Transactions** (`/transactions`) - Purchase and sales transaction management
- **Customers** (`/customers`) - Customer database management
- **Suppliers** (`/suppliers`) - Supplier and vendor management
- **Reports** (`/reports`) - Analytics and reporting section
  - Inventory Report (`/reports/inventory`)
  - Category Sales (`/reports/category-sales`)
  - Top Selling Products (`/reports/top-selling`)

## System Architecture

### Frontend Architecture
- **Framework**: React 18+ with TypeScript
- **UI Library**: Radix UI components with shadcn/ui design system
- **Styling**: Tailwind CSS with CSS variables for theming
- **Build Tool**: Vite for fast development and optimized builds
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Charts**: Recharts for data visualization

### Backend Architecture  
- **Runtime**: Pure Node.js HTTP server (no Express framework)
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **API Design**: RESTful endpoints with comprehensive error handling
- **Real-time Features**: EventEmitter for low stock notifications
- **Validation**: Custom input validation and domain-specific error handling
