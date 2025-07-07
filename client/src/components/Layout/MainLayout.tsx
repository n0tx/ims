import { useState } from "react";
import { TopBar } from "@/components/Dashboard/TopBar";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { 
  Package, 
  BarChart3, 
  ArrowRightLeft, 
  TrendingUp, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  Menu,
  X,
  Users,
  Building2
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";

interface MainLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  showTopBar?: boolean;
  dateFilter?: number;
  onDateFilterChange?: (days: number) => void;
}

/**
 * Main Layout Component with Collapsible Dynamic Sidebar
 * Provides consistent sidebar and content area structure for all pages
 * Features: Dynamic height, collapsible sidebar, responsive behavior, gap between sidebar and content
 */
export function MainLayout({ 
  children, 
  title, 
  subtitle, 
  showTopBar = true,
  dateFilter = 30,
  onDateFilterChange 
}: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false); // Mobile drawer state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false); // Desktop collapse state
  const isMobile = useIsMobile();
  const [location] = useLocation();

  const navigationItems = [
    { icon: BarChart3, label: "Dashboard", href: "/" },
    { icon: Package, label: "Products", href: "/products" },
    { icon: ArrowRightLeft, label: "Transactions", href: "/transactions" },
    { icon: Users, label: "Customers", href: "/customers" },
    { icon: Building2, label: "Suppliers", href: "/suppliers" },
    { icon: TrendingUp, label: "Reports", href: "/reports" }
  ];

  const isActive = (href: string) => {
    if (href === "/" && (location === "/" || location === "/dashboard")) {
      return true;
    }
    return location === href;
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleSidebarCollapse = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header with Hamburger */}
      {isMobile && (
        <div className="lg:hidden bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Package className="text-white text-sm" />
              </div>
              <h1 className="ml-3 text-xl font-bold text-gray-800">Inventory Pro</h1>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSidebar}
              className="p-2"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      )}

      {/* Main Container with Gap */}
      <div className="flex gap-6 min-h-screen">
        {/* Desktop Sidebar */}
        <aside className={cn(
          "hidden lg:block bg-gray-50 border-r border-gray-200 transition-all duration-200",
          sidebarCollapsed ? "w-16 p-2" : "w-60 p-4"
        )}>
          {/* Brand header */}
          <div className={cn(
            "border-b border-gray-200 pb-4 mb-4",
            sidebarCollapsed ? "px-2" : "px-0"
          )}>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Package className="text-white text-sm" />
                </div>
                {!sidebarCollapsed && (
                  <h1 className="ml-3 text-xl font-bold text-gray-800">Inventory Pro</h1>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleSidebarCollapse}
                className="p-2"
              >
                {sidebarCollapsed ? (
                  <ChevronRight className="h-4 w-4" />
                ) : (
                  <ChevronLeft className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Navigation menu */}
          <nav role="navigation" aria-label="Main navigation">
            <ul className="space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center p-3 rounded-lg font-medium transition-colors",
                        "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                        active
                          ? "text-primary bg-blue-50"
                          : "text-gray-600 hover:bg-gray-100",
                        sidebarCollapsed ? "justify-center" : ""
                      )}
                      aria-current={active ? "page" : undefined}
                      title={sidebarCollapsed ? item.label : undefined}
                    >
                      <Icon className="w-5 h-5" aria-hidden="true" />
                      {!sidebarCollapsed && (
                        <span className="ml-3">{item.label}</span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </aside>

        {/* Mobile Drawer */}
        {isMobile && (
          <>
            {/* Overlay */}
            {sidebarOpen && (
              <div 
                className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                onClick={() => setSidebarOpen(false)}
              />
            )}
            
            {/* Drawer */}
            <aside className={cn(
              "fixed top-0 left-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50 lg:hidden",
              sidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}>
              {/* Drawer header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                      <Package className="text-white text-sm" />
                    </div>
                    <h1 className="ml-3 text-xl font-bold text-gray-800">Inventory Pro</h1>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSidebarOpen(false)}
                    className="p-2"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              {/* Drawer navigation */}
              <nav className="p-4" role="navigation" aria-label="Main navigation">
                <ul className="space-y-2">
                  {navigationItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);
                    return (
                      <li key={item.label}>
                        <Link
                          href={item.href}
                          className={cn(
                            "flex items-center p-3 rounded-lg font-medium transition-colors",
                            "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                            active
                              ? "text-primary bg-blue-50"
                              : "text-gray-600 hover:bg-gray-100"
                          )}
                          aria-current={active ? "page" : undefined}
                          onClick={() => setSidebarOpen(false)}
                        >
                          <Icon className="w-5 h-5" aria-hidden="true" />
                          <span className="ml-3">{item.label}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            </aside>
          </>
        )}

        {/* Main content area */}
        <main className="flex-1 p-6 bg-white rounded shadow-sm">
          {/* Top bar */}
          {showTopBar && (
            <TopBar
              onMenuClick={toggleSidebar}
              dateFilter={dateFilter}
              onDateFilterChange={onDateFilterChange || (() => {})}
              isMobile={isMobile}
            />
          )}

          {/* Content area */}
          <div className={cn(showTopBar ? "mt-4" : "")}>
            {/* Page header */}
            {(title || subtitle) && (
              <div className="mb-6">
                {title && (
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    {title}
                  </h1>
                )}
                {subtitle && (
                  <p className="text-gray-600">
                    {subtitle}
                  </p>
                )}
              </div>
            )}

            {/* Page content */}
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}