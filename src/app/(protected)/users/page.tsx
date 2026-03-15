"use client";

/**
 * @fileoverview Users management page.
 *
 * Full CRUD table with:
 * - Create user dialog
 * - Edit user dialog
 * - Suspend / Ban actions with confirmation
 * - Permission editor modal (PermissionEditor)
 *
 * Security: All mutations require users.write on the backend.
 * The UI hides action buttons if the user lacks users.write, but the
 * server is the authoritative gatekeeper.
 */

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, ShieldAlert, Ban, Shield, Search, MoreHorizontal, UserCheck } from "lucide-react";
import { toast } from "sonner";

import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";

import {
  apiGetUsers, apiCreateUser, apiUpdateUser, apiSuspendUser, apiBanUser,
} from "@/lib/api";
import { getInitials } from "@/lib/utils";
import { usePermissions } from "@/hooks/usePermissions";
import { PermissionEditor } from "@/components/permission/PermissionEditor";
import type { User } from "@/types/api";

function UserStatusBadge({ user }: { user: User }) {
  if (user.isBanned)
    return <Badge variant="destructive" className="text-xs">Banned</Badge>;
  if (user.isSuspended)
    return <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-700">Suspended</Badge>;
  return <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">Active</Badge>;
}

export default function UsersPage() {
  const queryClient = useQueryClient();
  const { hasPermission } = usePermissions();
  const canWrite = hasPermission("users.write");

  const [search, setSearch] = useState("");

  // ── Dialogs state ──
  const [createOpen, setCreateOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [permUser, setPermUser] = useState<User | null>(null);
  const [permOpen, setPermOpen] = useState(false);

  // ── Form state ──
  const [form, setForm] = useState({ email: "", name: "", password: "" });
  const [editForm, setEditForm] = useState({ email: "", name: "" });

  // ── Queries ──
  const { data: users, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: async () => (await apiGetUsers()).data as User[],
  });

  // ── Mutations ──
  const createMutation = useMutation({
    mutationFn: () => apiCreateUser(form),
    onSuccess: () => {
      toast.success("User created successfully");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setCreateOpen(false);
      setForm({ email: "", name: "", password: "" });
    },
    onError: (e: { message?: string }) => toast.error(e.message ?? "Failed to create user"),
  });

  const updateMutation = useMutation({
    mutationFn: () => apiUpdateUser(editUser!.id, editForm),
    onSuccess: () => {
      toast.success("User updated");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setEditUser(null);
    },
    onError: (e: { message?: string }) => toast.error(e.message ?? "Failed to update user"),
  });

  const suspendMutation = useMutation({
    mutationFn: (id: string) => apiSuspendUser(id),
    onSuccess: () => {
      toast.success("User suspended");
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (e: { message?: string }) => toast.error(e.message ?? "Failed to suspend"),
  });

  const banMutation = useMutation({
    mutationFn: (id: string) => apiBanUser(id),
    onSuccess: () => {
      toast.warning("User banned");
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (e: { message?: string }) => toast.error(e.message ?? "Failed to ban"),
  });

  // ── Filtered list ──
  const filtered = (users ?? []).filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  function openEdit(user: User) {
    setEditUser(user);
    setEditForm({ email: user.email, name: user.name });
  }

  function openPermissions(user: User) {
    setPermUser(user);
    setPermOpen(true);
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Users</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage team members, roles, and permissions
          </p>
        </div>
        {canWrite && (
          <Button
            onClick={() => setCreateOpen(true)}
            className="gradient-obliq border-0 text-white hover:opacity-90 shadow-sm shadow-orange-100"
          >
            <Plus size={16} className="mr-1.5" />
            Add User
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search users…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="w-[240px]">User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-8 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                  </TableRow>
                ))
              : filtered.length === 0
              ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                      <UserCheck size={32} className="mx-auto mb-2 opacity-30" />
                      {search ? "No users match your search" : "No users yet"}
                    </TableCell>
                  </TableRow>
                )
              : filtered.map((user) => (
                  <TableRow key={user.id} className="hover:bg-muted/20">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="gradient-obliq text-white text-xs">
                            {getInitials(user.name)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-sm">{user.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{user.email}</TableCell>
                    <TableCell><UserStatusBadge user={user} /></TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {user.role?.name ?? "—"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger className="inline-flex items-center justify-center h-8 w-8 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                            <MoreHorizontal size={15} />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          {canWrite && (
                            <DropdownMenuItem onClick={() => openEdit(user)}>
                              <Pencil size={13} className="mr-2" /> Edit
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => openPermissions(user)}>
                            <Shield size={13} className="mr-2" /> Permissions
                          </DropdownMenuItem>
                          {canWrite && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-amber-600 focus:text-amber-700"
                                onClick={() => suspendMutation.mutate(user.id)}
                                disabled={suspendMutation.isPending || !!user.isSuspended}
                              >
                                <ShieldAlert size={13} className="mr-2" />
                                {user.isSuspended ? "Suspended" : "Suspend"}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => banMutation.mutate(user.id)}
                                disabled={banMutation.isPending || !!user.isBanned}
                              >
                                <Ban size={13} className="mr-2" />
                                {user.isBanned ? "Banned" : "Ban"}
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </div>

      {/* ── Create User Dialog ── */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Create User</DialogTitle>
            <DialogDescription>Add a new team member to your workspace.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {(["name", "email", "password"] as const).map((field) => (
              <div key={field} className="space-y-1.5">
                <Label className="capitalize">{field}</Label>
                <Input
                  type={field === "password" ? "password" : field === "email" ? "email" : "text"}
                  value={form[field]}
                  onChange={(e) => setForm((p) => ({ ...p, [field]: e.target.value }))}
                  placeholder={field === "email" ? "user@example.com" : field === "password" ? "Min. 8 characters" : "Full name"}
                />
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button
              onClick={() => createMutation.mutate()}
              disabled={createMutation.isPending}
              className="gradient-obliq border-0 text-white hover:opacity-90"
            >
              {createMutation.isPending ? "Creating…" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Edit User Dialog ── */}
      <Dialog open={!!editUser} onOpenChange={(o: boolean) => !o && setEditUser(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update user profile information.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {(["name", "email"] as const).map((field) => (
              <div key={field} className="space-y-1.5">
                <Label className="capitalize">{field}</Label>
                <Input
                  type={field === "email" ? "email" : "text"}
                  value={editForm[field]}
                  onChange={(e) => setEditForm((p) => ({ ...p, [field]: e.target.value }))}
                />
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditUser(null)}>Cancel</Button>
            <Button
              onClick={() => updateMutation.mutate()}
              disabled={updateMutation.isPending}
              className="gradient-obliq border-0 text-white hover:opacity-90"
            >
              {updateMutation.isPending ? "Saving…" : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Permission Editor ── */}
      <PermissionEditor
        user={permUser}
        open={permOpen}
        onOpenChange={(o) => { setPermOpen(o); if (!o) setPermUser(null); }}
      />
    </div>
  );
}
