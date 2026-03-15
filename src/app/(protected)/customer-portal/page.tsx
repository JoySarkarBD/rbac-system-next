"use client";

/**
 * @fileoverview Customer Portal page.
 * Portal overview with mock customer cards.
 */

import { Building2, Plus, Mail, Phone, Star } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const MOCK_CUSTOMERS = [
  { id: 1, name: "Acme Corporation", email: "contact@acme.com", phone: "+1 555-0100", plan: "Enterprise", rating: 5 },
  { id: 2, name: "Globex Industries", email: "info@globex.io", phone: "+1 555-0200", plan: "Pro", rating: 4 },
  { id: 3, name: "Initech Software", email: "hello@initech.dev", phone: "+1 555-0300", plan: "Starter", rating: 3 },
  { id: 4, name: "Umbrella Group", email: "ops@umbrella.com", phone: "+1 555-0400", plan: "Enterprise", rating: 5 },
];

const PLAN_COLORS: Record<string, string> = {
  Enterprise: "bg-purple-100 text-purple-700",
  Pro: "bg-blue-100 text-blue-700",
  Starter: "bg-green-100 text-green-700",
};

export default function CustomerPortalPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Building2 size={20} className="text-primary" /> Customer Portal
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">Manage your client accounts and interactions</p>
        </div>
        <Button className="gradient-obliq border-0 text-white hover:opacity-90 shadow-sm shadow-orange-100">
          <Plus size={16} className="mr-1.5" /> Add Customer
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {MOCK_CUSTOMERS.map((customer) => (
          <Card key={customer.id} className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
            <CardHeader className="pb-3">
              <div className="flex items-start gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="gradient-obliq text-white font-semibold text-sm">
                    {customer.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-sm leading-tight">{customer.name}</h3>
                    <Badge className={`text-xs border-0 flex-shrink-0 ${PLAN_COLORS[customer.plan] ?? "bg-muted"}`}>
                      {customer.plan}
                    </Badge>
                  </div>
                  <div className="flex gap-0.5 mt-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={10}
                        className={i < customer.rating ? "text-amber-400 fill-amber-400" : "text-muted-foreground/30"}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Mail size={12} /><span>{customer.email}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Phone size={12} /><span>{customer.phone}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
