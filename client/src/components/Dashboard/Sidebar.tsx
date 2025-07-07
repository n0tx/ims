import { cn } from "@/lib/utils";
import {
  Package,
  BarChart3,
  FileText,
  Settings,
  TrendingUp,
  ArrowRightLeft,
  Users,
  Building2,
} from "lucide-react";
import { Link, useLocation } from "wouter";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isMobile: boolean;
}

/**
 * Sidebar Navigation Component
 * Responsive sidebar with navigation menu and brand identity
 * Supports mobile collapse/expand functionality
 */
export function Sidebar({ isOpen, onClose, isMobile }: SidebarProps) {
  const [location] = useLocation();

  const navigationItems = [
    {
      icon: BarChart3,
      label: "Dashboard",
      href: "/",
    },
    {
      icon: Package,
      label: "Products",
      href: "/products",
    },
    {
      icon: ArrowRightLeft,
      label: "Transactions",
      href: "/transactions",
    },
    {
      icon: Users,
      label: "Customers",
      href: "/customers",
    },
    {
      icon: Building2,
      label: "Suppliers",
      href: "/suppliers",
    },
    {
      icon: TrendingUp,
      label: "Reports",
      href: "/reports",
    },
  ];

  const isActive = (href: string) => {
    if (href === "/" && (location === "/" || location === "/dashboard")) {
      return true;
    }
    return location === href;
  };

  return (
    <aside
      className={cn(
        "bg-white w-64 min-h-screen shadow-lg transition-transform duration-300 ease-in-out z-30",
        isMobile ? "fixed" : "relative",
        isMobile && !isOpen && "-translate-x-full",
      )}
    >
      {/* Brand header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Package className="text-white text-sm" />
          </div>
          <h1 className="ml-3 text-xl font-bold text-gray-800">
            Inventory Pro
          </h1>
        </div>
      </div>

      {/* Navigation menu */}
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
                      : "text-gray-600 hover:bg-gray-100",
                  )}
                  aria-current={active ? "page" : undefined}
                  onClick={isMobile ? onClose : undefined}
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
  );
}
