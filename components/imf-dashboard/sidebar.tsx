"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  BarChart3, 
  DollarSign, 
  Settings,
  ChevronLeft,
  ChevronRight,
  Building
} from "lucide-react";
import { cn } from "@/lib/utils";

export function IMFDashboardSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const navItems = [
    {
      label: "Dashboard",
      href: "/imf-dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />
    },
    {
      label: "Loan Applications",
      href: "/imf-dashboard/applications",
      icon: <FileText className="h-5 w-5" />
    },
    {
      label: "Farmers",
      href: "/imf-dashboard/farmers",
      icon: <Users className="h-5 w-5" />
    },
    {
      label: "Analytics",
      href: "/imf-dashboard/analytics",
      icon: <BarChart3 className="h-5 w-5" />
    },
    {
      label: "Finances",
      href: "/imf-dashboard/finances",
      icon: <DollarSign className="h-5 w-5" />
    },
    {
      label: "Institution Profile",
      href: "/imf-dashboard/profile",
      icon: <Building className="h-5 w-5" />
    },
    {
      label: "Settings",
      href: "/imf-dashboard/settings",
      icon: <Settings className="h-5 w-5" />
    }
  ];

  return (
    <div className={cn(
      "h-screen bg-white border-r flex flex-col transition-all duration-300",
      collapsed ? "w-16" : "w-64"
    )}>
      <div className="p-4 border-b flex justify-between items-center">
        {!collapsed && <h2 className="font-semibold text-lg">IMF Dashboard</h2>}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>
      
      <div className="flex-1 py-6 flex flex-col gap-2 px-2">
        {navItems.map((item) => (
          <Link 
            key={item.href} 
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
              pathname === item.href 
                ? "bg-blue-50 text-blue-700" 
                : "text-gray-600 hover:bg-gray-100"
            )}
          >
            {item.icon}
            {!collapsed && <span>{item.label}</span>}
          </Link>
        ))}
      </div>
    </div>
  );
} 