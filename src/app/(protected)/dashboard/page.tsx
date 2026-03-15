"use client";

/**
 * @fileoverview Dashboard page.
 * Shows summary stats fetched from API and a welcome message.
 */

import { useQuery } from "@tanstack/react-query";
import { Users, Shield, ScrollText, TrendingUp, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { apiGetUsers, apiGetAuditLogs, getToken } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { usePermissions } from "@/hooks/usePermissions";

export default function DashboardPage() {
  const { hasPermission } = usePermissions();

  // Decode name from token for greeting
  let userName = "Admin";
  if (typeof window !== "undefined") {
    try {
      const token = getToken();
      if (token) {
        const payload = JSON.parse(atob(token.split(".")[1]!));
        userName = payload.name ?? payload.email ?? "Admin";
      }
    } catch { /* ignore */ }
  }

  const usersQuery = useQuery({
    queryKey: ["users"],
    queryFn: async () => (await apiGetUsers()).data,
    enabled: hasPermission("users.read"),
  });

  const auditQuery = useQuery({
    queryKey: ["audit-logs"],
    queryFn: async () => (await apiGetAuditLogs()).data,
    enabled: hasPermission("audit.read"),
  });

  const stats = [
    {
      title: "Total Users",
      value: usersQuery.data?.length ?? "—",
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
      href: "/users",
      enabled: hasPermission("users.read"),
    },
    {
      title: "Active Permissions",
      value: "—",
      icon: Shield,
      color: "text-orange-600",
      bg: "bg-orange-50",
      href: "/settings",
      enabled: true,
    },
    {
      title: "Audit Events",
      value: auditQuery.data?.length ?? "—",
      icon: ScrollText,
      color: "text-purple-600",
      bg: "bg-purple-50",
      href: "/audit",
      enabled: hasPermission("audit.read"),
    },
    {
      title: "Active This Month",
      value: "—",
      icon: TrendingUp,
      color: "text-green-600",
      bg: "bg-green-50",
      href: "/reports",
      enabled: true,
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero greeting */}
      <div className="rounded-2xl gradient-obliq p-6 text-white shadow-lg shadow-orange-100">
        <p className="text-sm font-medium text-white/80 mb-1">Welcome back 👋</p>
        <h2 className="text-2xl font-bold">{userName}</h2>
        <p className="text-white/70 text-sm mt-1.5">
          Here&apos;s what&apos;s happening across your workspace today.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="hover:shadow-md transition-shadow border-0 shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                    <Icon size={20} className={stat.color} />
                  </div>
                  {stat.enabled && (
                    <Link href={stat.href}>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground">
                        <ArrowRight size={14} />
                      </Button>
                    </Link>
                  )}
                </div>
                <div>
                  {usersQuery.isLoading && stat.title === "Total Users" ? (
                    <Skeleton className="h-7 w-12 mb-1" />
                  ) : (
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  )}
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick actions + recent audit */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick actions */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Quick Actions</CardTitle>
            <CardDescription>Common admin tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              { label: "Manage Users", href: "/users", perm: "users.read" },
              { label: "View Audit Logs", href: "/audit", perm: "audit.read" },
              { label: "System Settings", href: "/settings", perm: "settings.manage" },
              { label: "Customer Portal", href: "/customer-portal", perm: undefined },
            ]
              .filter((a) => !a.perm || hasPermission(a.perm))
              .map((action) => (
                <Link key={action.href} href={action.href} className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors group">
                  <span className="text-sm font-medium">{action.label}</span>
                  <ArrowRight size={14} className="text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                </Link>
              ))}
          </CardContent>
        </Card>

        {/* Recent audit events */}
        {hasPermission("audit.read") && (
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Recent Audit Events</CardTitle>
              <CardDescription>Last 5 system events</CardDescription>
            </CardHeader>
            <CardContent>
              {auditQuery.isLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
                </div>
              ) : auditQuery.data?.length ? (
                <div className="space-y-2">
                  {auditQuery.data.slice(0, 5).map((log) => (
                    <div key={log.id} className="flex items-start justify-between gap-3 p-2.5 rounded-lg bg-muted/40">
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{log.action}</p>
                        <p className="text-xs text-muted-foreground truncate">{log.resource}</p>
                      </div>
                      <Badge variant="secondary" className="text-[10px] flex-shrink-0">
                        {formatDate(log.createdAt)}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-6">No audit events yet</p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
