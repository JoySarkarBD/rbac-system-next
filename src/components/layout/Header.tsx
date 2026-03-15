"use client";

/**
 * @fileoverview Header component.
 *
 * Shows the current page title, user avatar and a dropdown with logout.
 * Logout clears tokens and redirects to /login.
 */

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PERMISSIONS_QUERY_KEY } from "@/hooks/usePermissions";
import { apiLogout, clearTokens } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, LogOut, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface HeaderProps {
  userName?: string;
  userEmail?: string;
  pageTitle?: string;
}

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

export function Header({ userName = "Admin", userEmail = "", pageTitle }: HeaderProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const logoutMutation = useMutation({
    mutationFn: apiLogout,
    onSuccess: () => {
      clearTokens();
      // Invalidate all queries so stale data isn't shown on next login
      queryClient.clear();
      router.push("/login");
      toast.success("Logged out successfully");
    },
    onError: () => {
      // Even on API error, clear local tokens — best-effort logout
      clearTokens();
      queryClient.removeQueries({ queryKey: PERMISSIONS_QUERY_KEY });
      router.push("/login");
    },
  });

  return (
    <header className="flex items-center justify-between h-16 px-6 border-b bg-white/80 backdrop-blur-sm sticky top-0 z-20">
      {/* Page title */}
      <div>
        {pageTitle && (
          <h1 className="text-lg font-semibold text-foreground">{pageTitle}</h1>
        )}
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-3">
        {/* Notification bell (placeholder) */}
        <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
          <Bell size={18} />
          <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 text-[10px] flex items-center justify-center gradient-obliq border-0 text-white">
            3
          </Badge>
        </Button>

        {/* User dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2.5 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary">
              <Avatar className="h-8 w-8 cursor-pointer ring-2 ring-primary/30 hover:ring-primary transition-all">
                <AvatarFallback className="gradient-obliq text-white text-xs font-semibold">
                  {getInitials(userName)}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium leading-none text-foreground">{userName}</p>
                {userEmail && (
                  <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-[140px]">{userEmail}</p>
                )}
              </div>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-52 bg-white">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col gap-0.5">
                <p className="font-semibold text-sm">{userName}</p>
                {userEmail && <p className="text-xs text-muted-foreground truncate">{userEmail}</p>}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer">
              <User size={14} className="mr-2" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive cursor-pointer"
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
            >
              <LogOut size={14} className="mr-2" />
              {logoutMutation.isPending ? "Logging out…" : "Logout"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
