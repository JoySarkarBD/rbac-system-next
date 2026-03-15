"use client";

/**
 * @fileoverview Settings page.
 * Shows all system permissions (requires settings.manage).
 */

import { useQuery } from "@tanstack/react-query";
import { Settings as SettingsIcon, Lock, HelpCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { apiGetAllPermissions } from "@/lib/api";
import { usePermissions } from "@/hooks/usePermissions";
import { getPermissionModule } from "@/lib/utils";
import type { Permission } from "@/types/api";

export default function SettingsPage() {
  const { hasPermission } = usePermissions();
  const canManage = hasPermission("settings.manage");

  const { data: allPerms, isLoading } = useQuery({
    queryKey: ["permissions", "all"],
    queryFn: async () => (await apiGetAllPermissions()).data as Permission[],
    enabled: canManage,
  });

  if (!canManage && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <Lock size={48} className="text-muted-foreground/30 mb-4" />
        <h2 className="text-lg font-semibold">Access Restricted</h2>
        <p className="text-sm text-muted-foreground mt-1">
          You need <code className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">settings.manage</code> permission.
        </p>
      </div>
    );
  }

  const grouped = (allPerms ?? []).reduce<Record<string, Permission[]>>((acc, p) => {
    const mod = getPermissionModule(p.atom);
    if (!acc[mod]) acc[mod] = [];
    acc[mod].push(p);
    return acc;
  }, {});

  return (
    <TooltipProvider>
      <div className="space-y-6 animate-fade-in max-w-3xl">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <SettingsIcon size={20} className="text-primary" />
            Settings
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            System configuration and permission management
          </p>
        </div>

        {/* Permissions catalogue */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">System Permissions</CardTitle>
            <CardDescription>All registered permission atoms in the system</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(grouped).map(([module, perms]) => (
                  <div key={module}>
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="secondary" className="capitalize font-semibold">{module}</Badge>
                      <Separator className="flex-1" />
                      <span className="text-xs text-muted-foreground">{perms.length} permission{perms.length !== 1 ? "s" : ""}</span>
                    </div>
                    <div className="grid gap-2">
                      {perms.map((perm) => (
                        <div
                          key={perm.atom}
                          className="flex items-center justify-between p-3 rounded-lg bg-muted/40 hover:bg-muted/60 transition-colors group"
                        >
                          <div className="flex items-center gap-2.5">
                            <code className="text-sm font-mono font-medium text-foreground">{perm.atom}</code>
                            {perm.description && (
                              <Tooltip>
                                <TooltipTrigger>
                                  <HelpCircle size={13} className="text-muted-foreground group-hover:text-foreground transition-colors" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{perm.description}</p>
                                </TooltipContent>
                              </Tooltip>
                            )}
                          </div>
                          <Badge variant="outline" className="text-xs capitalize">{module}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}
