import { Menu, User } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface TopBarProps {
  onMenuClick: () => void;
  dateFilter: number;
  onDateFilterChange: (days: number) => void;
  isMobile: boolean;
}

/**
 * Top Navigation Bar Component
 * Contains mobile menu toggle, page title, date filter, and user profile
 * Implements WCAG AA accessibility standards
 */
export function TopBar({ onMenuClick, dateFilter, onDateFilterChange, isMobile }: TopBarProps) {
  const dateFilterOptions = [
    { value: "7", label: "Last 7 days" },
    { value: "30", label: "Last 30 days" },
    { value: "90", label: "Last 90 days" },
    { value: "365", label: "Last year" },
  ];

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {/* Mobile menu button */}
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onMenuClick}
              className="mr-2"
              aria-label="Open navigation menu"
            >
              <Menu className="h-6 w-6 text-gray-600" />
            </Button>
          )}
          
          <h2 className="text-2xl font-bold text-gray-800">Dashboard Overview</h2>
        </div>

        <div className="flex items-center space-x-4">
          {/* Date filter dropdown */}
          <Select
            value={dateFilter.toString()}
            onValueChange={(value) => onDateFilterChange(parseInt(value))}
          >
            <SelectTrigger className="w-40" aria-label="Select date range">
              <SelectValue placeholder="Select date range" />
            </SelectTrigger>
            <SelectContent>
              {dateFilterOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* User profile section */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-gray-600" />
            </div>
            <span className="text-sm text-gray-600 hidden sm:block">John Admin</span>
          </div>
        </div>
      </div>
    </header>
  );
}
