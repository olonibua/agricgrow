"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  FileText, 
  // BarChart3, 
  // Calendar, 
  Settings,
  ChevronLeft,
  ChevronRight,
    Tractor
} from "lucide-react";
import { cn } from "@/lib/utils";

export function DashboardSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const navItems = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />
    },
    {
      label: "My Loans",
      href: "/dashboard/loans",
      icon: <FileText className="h-5 w-5" />
    },
    // {
    //   label: "Farm Profile",
    //   href: "/dashboard/profile",
    //   icon: <Tractor className="h-5 w-5" />
    // },
    // {
    //   label: "Analytics",
    //   href: "/dashboard/analytics",
    //   icon: <BarChart3 className="h-5 w-5" />
    // },
    // {
    //   label: "Calendar",
    //   href: "/dashboard/calendar",
    //   icon: <Calendar className="h-5 w-5" />
    // },
    {
      label: "Settings",
      href: "/dashboard/settings",
      icon: <Settings className="h-5 w-5" />
    }
  ];

  return (
    <div className={cn(
      "h-screen bg-white border-r flex flex-col transition-all duration-300",
      collapsed ? "w-16" : "w-64"
    )}>
      <div className="p-4 border-b flex justify-between items-center">
        {!collapsed && <h2 className="font-semibold text-lg">Farmer Dashboard</h2>}
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
                ? "bg-green-50 text-green-700" 
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