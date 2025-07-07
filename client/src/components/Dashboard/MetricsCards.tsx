import { Package, DollarSign, AlertTriangle, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface MetricsCardsProps {
  metrics?: {
    totalProducts: number;
    inventoryValue: string;
    lowStockCount: number;
    totalRevenue: string;
  };
  lowStockCount: number;
  onLowStockClick: () => void;
  isLoading: boolean;
}

/**
 * Dashboard Metrics Cards Component
 * Displays key performance indicators with proper loading states
 * Implements clickable low stock card for navigation
 */
export function MetricsCards({ metrics, lowStockCount, onLowStockClick, isLoading }: MetricsCardsProps) {
  const cards = [
    {
      title: "Total Products",
      value: metrics?.totalProducts || 0,
      trend: "+12% from last month",
      icon: Package,
      bgColor: "bg-blue-50",
      iconColor: "text-primary",
      clickable: false,
    },
    {
      title: "Inventory Value",
      value: `$${metrics?.inventoryValue || "0.00"}`,
      trend: "+8% from last month",
      icon: DollarSign,
      bgColor: "bg-green-50",
      iconColor: "text-secondary",
      clickable: false,
    },
    {
      title: "Low Stock Items",
      value: lowStockCount,
      trend: "Requires attention",
      icon: AlertTriangle,
      bgColor: "bg-orange-50",
      iconColor: "text-accent",
      clickable: true,
      onClick: onLowStockClick,
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-6">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-12 w-12 rounded-lg" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card
            key={card.title}
            className={`p-6 border border-gray-100 transition-shadow ${
              card.clickable ? "cursor-pointer hover:shadow-md" : ""
            }`}
            onClick={card.clickable ? card.onClick : undefined}
            role={card.clickable ? "button" : undefined}
            tabIndex={card.clickable ? 0 : undefined}
            onKeyDown={
              card.clickable
                ? (e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      card.onClick?.();
                    }
                  }
                : undefined
            }
            aria-label={card.clickable ? `View ${card.title.toLowerCase()}` : undefined}
          >
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {card.value.toLocaleString()}
                  </p>
                  <p className={`text-sm mt-1 ${card.clickable ? "text-accent" : "text-secondary"}`}>
                    {card.clickable ? (
                      <>
                        <AlertTriangle className="inline w-3 h-3 mr-1" />
                        {card.trend}
                      </>
                    ) : (
                      <>
                        <TrendingUp className="inline w-3 h-3 mr-1" />
                        {card.trend}
                      </>
                    )}
                  </p>
                </div>
                <div className={`w-12 h-12 ${card.bgColor} rounded-lg flex items-center justify-center`}>
                  <Icon className={`${card.iconColor} text-xl`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
