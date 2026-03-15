"use client";

/**
 * @fileoverview Leads page.
 * Placeholder UI with professional empty state and mock lead cards.
 */

import { Target, Plus, TrendingUp, Users, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const MOCK_LEADS = [
  { id: 1, name: "Acme Corp", status: "Qualified", value: "$12,400", stage: "Demo" },
  { id: 2, name: "Globex Inc", status: "New", value: "$8,200", stage: "Outreach" },
  { id: 3, name: "Initech LLC", status: "Negotiation", value: "$34,500", stage: "Proposal" },
  { id: 4, name: "Umbrella Co", status: "Closed", value: "$21,000", stage: "Closed Won" },
];

const STATUS_COLORS: Record<string, string> = {
  Qualified: "bg-green-100 text-green-700",
  New: "bg-blue-100 text-blue-700",
  Negotiation: "bg-amber-100 text-amber-700",
  Closed: "bg-purple-100 text-purple-700",
};

export default function LeadsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Target size={20} className="text-primary" /> Leads
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">Track and manage your sales pipeline</p>
        </div>
        <Button className="gradient-obliq border-0 text-white hover:opacity-90 shadow-sm shadow-orange-100">
          <Plus size={16} className="mr-1.5" /> Add Lead
        </Button>
      </div>

      {/* Pipeline stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Leads", value: "24", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Qualified", value: "11", icon: TrendingUp, color: "text-green-600", bg: "bg-green-50" },
          { label: "Closed Won", value: "7", icon: CheckCircle2, color: "text-purple-600", bg: "bg-purple-50" },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className="border-0 shadow-sm">
              <CardContent className="p-5 flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}>
                  <Icon size={20} className={s.color} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{s.value}</p>
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Mock lead cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {MOCK_LEADS.map((lead) => (
          <Card key={lead.id} className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <CardTitle className="text-base">{lead.name}</CardTitle>
                <Badge className={`text-xs border-0 ${STATUS_COLORS[lead.status] ?? "bg-muted text-muted-foreground"}`}>
                  {lead.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Stage: <span className="font-medium text-foreground">{lead.stage}</span></span>
                <span className="font-semibold text-primary">{lead.value}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
