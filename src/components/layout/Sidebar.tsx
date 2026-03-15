"use client";

/**
 * @fileoverview Sidebar component.
 *
 * Dynamically builds nav links from the user's permissions.
 * Only routes the user is permitted to see are rendered — this is a UX
 * decision; actual access control is enforced server-side per API call.
 *
 * Performance: Permission list is cached for 5 min by usePermissions().
 */

import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { usePermissions } from "@/hooks/usePermissions";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  Building2,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  ScrollText,
  Settings,
  Target,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  /** Permission atom required. Undefined = always visible to authenticated users. */
  permission?: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard",       href: "/dashboard",        icon: LayoutDashboard },
  { label: "Users",           href: "/users",            icon: Users,          permission: "users.read" },
  { label: "Leads",           href: "/leads",            icon: Target },
  { label: "Tasks",           href: "/tasks",            icon: CheckSquare },
  { label: "Reports",         href: "/reports",          icon: BarChart3 },
  { label: "Audit",           href: "/audit",            icon: ScrollText,     permission: "audit.read" },
  { label: "Customer Portal", href: "/customer-portal",  icon: Building2 },
  { label: "Settings",        href: "/settings",         icon: Settings,       permission: "settings.manage" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { hasPermission, isLoading } = usePermissions();
  const [collapsed, setCollapsed] = useState(false);

  const visibleItems = NAV_ITEMS.filter(
    (item) => !item.permission || hasPermission(item.permission)
  );

  return (
    <TooltipProvider>
      <aside
        className={cn(
          "relative flex flex-col h-full border-r transition-all duration-300 ease-in-out",
          "bg-white",
          collapsed ? "w-16" : "w-64"
        )}
      >
        {/* Logo */}
          <div className={cn("flex items-center gap-3 px-4 py-3 border-b", collapsed && "justify-center px-2")}>
           {collapsed && (
          <div className="flex-shrink-0 w-8 h-10 rounded-lg gradient-obliq flex items-center justify-center shadow-md">
            <span className="text-white font-bold text-sm">O</span>
          </div>
          )}
          {!collapsed && (
             <Image
              src="/logo.png"
              alt="Logo"
              width={100}
              height={100}
              priority
              />
          )}
        </div>

        {/* Nav Items */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
          {isLoading
            ? Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full rounded-lg bg-[hsl(var(--sidebar-accent))]" />
              ))
            : visibleItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                const Icon = item.icon;

                const link = (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                      isActive
                        ? "bg-[#F46B4B] text-white shadow-sm"
                        : "text-[hsl(var(--sidebar-foreground))] hover:bg-[#F46B4B] hover:text-white",
                      collapsed && "justify-center px-2"
                    )}
                  >
                    <Icon
                      size={18}
                      className={cn(
                        "flex-shrink-0 transition-transform duration-150",
                        isActive ? "text-black" : "text-black group-hover:text-black",
                        !collapsed && isActive && "scale-105"
                      )}
                    />
                    {!collapsed && (
                      <span className="truncate animate-fade-in text-black">{item.label}</span>
                    )}
                  </Link>
                );

                if (collapsed) {
                  return (
                    <Tooltip key={item.href}>
                      <TooltipTrigger>{link}</TooltipTrigger>
                      <TooltipContent side="right">
                        <p>{item.label}</p>
                      </TooltipContent>
                    </Tooltip>
                  );
                }

                return link;
              })}
        </nav>

        {/* Collapse Toggle */}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className={cn(
            "absolute -right-3 top-[60px] -translate-y-1/2 z-50",
            "flex items-center justify-center w-6 h-6 rounded-full",
            "bg-white border border-gray-200",
            "text-black hover:text-white hover:bg-[#F46B4B]",
            "transition-all duration-200 shadow-sm"
          )}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>
      </aside>
    </TooltipProvider>
  );
}
