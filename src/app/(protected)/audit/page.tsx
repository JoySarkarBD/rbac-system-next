"use client";

/**
 * @fileoverview Audit log page.
 * Fetches all audit events and displays them in a sortable table.
 * Requires audit.read permission — backend enforces this, UI shows 403 state if missing.
 */

import { useQuery } from "@tanstack/react-query";
import { ScrollText, Search, RefreshCw } from "lucide-react";
import { useState } from "react";

import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

import { apiGetAuditLogs } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { usePermissions } from "@/hooks/usePermissions";
import type { AuditLog } from "@/types/api";

function actionColor(action: string) {
  if (action.includes("create") || action.includes("POST")) return "bg-green-100 text-green-700";
  if (action.includes("update") || action.includes("PUT") || action.includes("PATCH")) return "bg-blue-100 text-blue-700";
  if (action.includes("delete") || action.includes("ban") || action.includes("suspend")) return "bg-red-100 text-red-700";
  return "bg-muted text-muted-foreground";
}

export default function AuditPage() {
  const { hasPermission } = usePermissions();
  const [search, setSearch] = useState("");

  const { data: logs, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["audit-logs"],
    queryFn: async () => (await apiGetAuditLogs()).data as AuditLog[],
    enabled: hasPermission("audit.read"),
  });

  if (!hasPermission("audit.read") && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <ScrollText size={48} className="text-muted-foreground/30 mb-4" />
        <h2 className="text-lg font-semibold text-foreground">Access Restricted</h2>
        <p className="text-sm text-muted-foreground mt-1">You need the <code className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">audit.read</code> permission.</p>
      </div>
    );
  }

  const filtered = (logs ?? []).filter(
    (l) =>
      l.action?.toLowerCase().includes(search.toLowerCase()) ||
      l.resource?.toLowerCase().includes(search.toLowerCase()) ||
      l.actorName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Audit Logs</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Track every system action for compliance and debugging
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
        >
          <RefreshCw size={14} className={`mr-1.5 ${isFetching ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <CardTitle className="text-base">Event Log</CardTitle>
              <CardDescription>
                {logs?.length ?? 0} total events
              </CardDescription>
            </div>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search events…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 w-56"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead>Actor</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Resource</TableHead>
                <TableHead>Detail</TableHead>
                <TableHead className="text-right">Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 5 }).map((__, j) => (
                        <TableCell key={j}><Skeleton className="h-4 w-24" /></TableCell>
                      ))}
                    </TableRow>
                  ))
                : filtered.length === 0
                ? (
                    <TableRow>
                      <TableCell colSpan={5} className="py-12 text-center text-muted-foreground">
                        <ScrollText size={32} className="mx-auto mb-2 opacity-30" />
                        {search ? "No events match" : "No audit logs yet"}
                      </TableCell>
                    </TableRow>
                  )
                : filtered.map((log) => (
                    <TableRow key={log.id} className="hover:bg-muted/20">
                      <TableCell className="text-sm font-medium">
                        {log.actorName ?? (log.actorId ? log.actorId.slice(0, 8) + "…" : "Unknown")}
                      </TableCell>
                      <TableCell>
                        <Badge className={`text-xs border-0 ${actionColor(log.action)}`}>
                          {log.action}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {log.resource ?? "—"}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[180px] truncate">
                        {log.detail ?? "—"}
                      </TableCell>
                      <TableCell className="text-right text-xs text-muted-foreground whitespace-nowrap">
                        {formatDate(log.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
