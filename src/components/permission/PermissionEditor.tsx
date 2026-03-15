"use client";

/**
 * @fileoverview PermissionEditor component.
 *
 * A modal dialog that shows all system permissions as toggles.
 * Grant ceiling: permissions the acting user doesn't hold are disabled
 * with a tooltip explaining why — matching the backend enforcement.
 *
 * Security: The server re-validates the grant ceiling on PUT /users/:id/permissions.
 * The UI restriction is strictly a UX affordance.
 */

import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Shield, AlertTriangle, Lock } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";

import { apiGetAllPermissions, apiUpdateUserPermissions } from "@/lib/api";
import { usePermissions } from "@/hooks/usePermissions";
import { getPermissionModule } from "@/lib/utils";
import type { User, Permission } from "@/types/api";

interface PermissionEditorProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PermissionEditor({ user, open, onOpenChange }: PermissionEditorProps) {
  const queryClient = useQueryClient();
  const { permissionAtoms: myAtoms } = usePermissions();

  // All system permissions
  const { data: allPerms, isLoading: loadingAll } = useQuery({
    queryKey: ["permissions", "all"],
    queryFn: async () => {
      const res = await apiGetAllPermissions();
      return res.data as Permission[];
    },
    enabled: open,
    staleTime: 5 * 60 * 1000,
  });

  // Track which atoms the target user currently has
  const [selectedAtoms, setSelectedAtoms] = useState<Set<string>>(new Set());

  // Initialize from user's current permissions when dialog opens
  useEffect(() => {
    if (open && user) {
      const current = new Set<string>(
        (user.permissions ?? []).map((up) => up.permission?.atom ?? "")
      );
      setSelectedAtoms(current);
    }
  }, [open, user]);

  const mutation = useMutation({
    mutationFn: (atoms: string[]) =>
      apiUpdateUserPermissions(user!.id, { permissions: atoms }),
    onSuccess: () => {
      toast.success("Permissions updated successfully");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      onOpenChange(false);
    },
    onError: (err: { message?: string } | unknown) => {
      const msg =
        (err as { message?: string })?.message ?? "Failed to update permissions";
      toast.error(msg.includes("Grant ceiling")
        ? "You cannot grant a permission you don't possess."
        : msg
      );
    },
  });

  function handleToggle(atom: string, checked: boolean) {
    setSelectedAtoms((prev) => {
      const next = new Set(prev);
      if (checked) next.add(atom);
      else next.delete(atom);
      return next;
    });
  }

  function handleSave() {
    mutation.mutate(Array.from(selectedAtoms));
  }

  // Group by module for readability
  const grouped = (allPerms ?? []).reduce<Record<string, Permission[]>>((acc, p) => {
    const mod = getPermissionModule(p.atom);
    if (!acc[mod]) acc[mod] = [];
    acc[mod].push(p);
    return acc;
  }, {});

  return (
    <TooltipProvider>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield size={18} className="text-primary" />
              Edit Permissions
            </DialogTitle>
            <DialogDescription>
              Managing permissions for{" "}
              <span className="font-semibold text-foreground">{user?.name}</span>
              . Grayed-out items exceed your grant ceiling.
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[420px] pr-2">
            {loadingAll ? (
              <div className="space-y-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full rounded-lg" />
                ))}
              </div>
            ) : (
              <div className="space-y-5">
                {Object.entries(grouped).map(([module, perms]) => (
                  <div key={module}>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary" className="capitalize text-xs font-semibold">
                        {module}
                      </Badge>
                      <Separator className="flex-1" />
                    </div>
                    <div className="space-y-2">
                      {perms.map((perm) => {
                        const iCanGrant = myAtoms.has(perm.atom);
                        const isChecked = selectedAtoms.has(perm.atom);

                        const toggle = (
                          <div
                            key={perm.atom}
                            className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                              isChecked
                                ? "bg-accent border-primary/20"
                                : "bg-muted/40 border-transparent"
                            } ${!iCanGrant ? "opacity-50" : ""}`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              {!iCanGrant && (
                                <Lock size={13} className="text-muted-foreground flex-shrink-0" />
                              )}
                              <div>
                                <p className="text-sm font-mono font-medium text-foreground">
                                  {perm.atom}
                                </p>
                                {perm.description && (
                                  <p className="text-xs text-muted-foreground">{perm.description}</p>
                                )}
                              </div>
                            </div>
                            <Switch
                              checked={isChecked}
                              onCheckedChange={(checked: boolean) => handleToggle(perm.atom, checked)}
                              disabled={!iCanGrant}
                              aria-label={`Toggle ${perm.atom}`}
                            />
                          </div>
                        );

                        if (!iCanGrant) {
                          return (
                            <Tooltip key={perm.atom}>
                              <TooltipTrigger>
                                <div>{toggle}</div>
                              </TooltipTrigger>
                              <TooltipContent side="left" className="flex items-center gap-1.5">
                                <AlertTriangle size={12} className="text-amber-400" />
                                <span>Grant ceiling: you don&apos;t have <code className="font-mono text-xs">{perm.atom}</code></span>
                              </TooltipContent>
                            </Tooltip>
                          );
                        }

                        return toggle;
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={mutation.isPending || loadingAll}
              className="gradient-obliq border-0 text-white hover:opacity-90"
            >
              {mutation.isPending ? "Saving…" : "Save Permissions"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}
