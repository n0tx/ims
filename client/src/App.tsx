import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Dashboard from "@/pages/dashboard";
import Products from "@/pages/products";
import Transactions from "@/pages/transactions";
import Customers from "@/pages/customers";
import Suppliers from "@/pages/suppliers";
import InventoryReport from "@/pages/reports/inventory";
import MonthlySalesReport from "@/pages/reports/monthly-sales";
import CategorySalesReport from "@/pages/reports/category-sales";
import TopSellingReport from "@/pages/reports/top-selling";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/products" component={Products} />
      <Route path="/transactions" component={Transactions} />
      <Route path="/customers" component={Customers} />
      <Route path="/suppliers" component={Suppliers} />
      <Route path="/reports">
        {() => {
          window.location.replace('/reports/inventory');
          return null;
        }}
      </Route>
      <Route path="/reports/inventory" component={InventoryReport} />
      <Route path="/reports/monthly-sales" component={MonthlySalesReport} />
      <Route path="/reports/category-sales" component={CategorySalesReport} />
      <Route path="/reports/top-selling" component={TopSellingReport} />
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
