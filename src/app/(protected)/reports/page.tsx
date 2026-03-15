"use client";

/**
 * @fileoverview Reports page.
 * Mock analytics dashboard with stat cards and bar chart visualization.
 */

import { BarChart3, TrendingUp, Users, DollarSign, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const MONTHLY_DATA = [
  { month: "Oct", value: 65 },
  { month: "Nov", value: 78 },
  { month: "Dec", value: 60 },
  { month: "Jan", value: 82 },
  { month: "Feb", value: 91 },
  { month: "Mar", value: 74 },
];

const MAX_VAL = Math.max(...MONTHLY_DATA.map((d) => d.value));

export default function ReportsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold flex items-center gap-2">
          <BarChart3 size={20} className="text-primary" /> Reports
        </h2>
        <p className="text-sm text-muted-foreground mt-0.5">Analytics and performance insights</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Monthly Revenue", value: "$48,350", change: "+12%", icon: DollarSign, color: "text-green-600", bg: "bg-green-50" },
          { label: "Active Users", value: "1,284", change: "+5%", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Growth Rate", value: "18.4%", change: "+2.1%", icon: TrendingUp, color: "text-purple-600", bg: "bg-purple-50" },
          { label: "Uptime", value: "99.98%", change: "0%", icon: Activity, color: "text-orange-600", bg: "bg-orange-50" },
        ].map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.label} className="border-0 shadow-sm">
              <CardContent className="p-5">
                <div className={`w-9 h-9 rounded-lg ${kpi.bg} flex items-center justify-center mb-3`}>
                  <Icon size={18} className={kpi.color} />
                </div>
                <p className="text-2xl font-bold">{kpi.value}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-sm text-muted-foreground">{kpi.label}</p>
                  <Badge variant="secondary" className="text-[10px] bg-green-100 text-green-700 ml-auto">{kpi.change}</Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Chart */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">User Activity</CardTitle>
              <CardDescription>Monthly active users over 6 months</CardDescription>
            </div>
            <Tabs defaultValue="monthly">
              <TabsList className="h-8">
                <TabsTrigger value="weekly" className="text-xs h-6">Weekly</TabsTrigger>
                <TabsTrigger value="monthly" className="text-xs h-6">Monthly</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          {/* SVG bar chart */}
          <div className="flex items-end gap-3 h-40 pr-4">
            {MONTHLY_DATA.map((d) => {
              const heightPct = (d.value / MAX_VAL) * 100;
              return (
                <div key={d.month} className="flex flex-col items-center gap-1.5 flex-1">
                  <span className="text-xs font-semibold text-foreground">{d.value}</span>
                  <div
                    className="w-full rounded-t-md gradient-obliq opacity-80 hover:opacity-100 transition-opacity"
                    style={{ height: `${heightPct}%`, minHeight: "12px" }}
                  />
                  <span className="text-xs text-muted-foreground">{d.month}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
