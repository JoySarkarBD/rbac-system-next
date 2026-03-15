"use client";

/**
 * @fileoverview usePermissions hook.
 *
 * Fetches the current user's permissions from /api/me/permissions.
 * Uses a 5-minute stale time so the list doesn't re-fetch on every navigation.
 * This is the single source of truth for permission checks in the UI.
 */

import { useQuery } from "@tanstack/react-query";
import { apiGetMyPermissions } from "@/lib/api";
import type { Permission } from "@/types/api";

export const PERMISSIONS_QUERY_KEY = ["me", "permissions"] as const;

export function usePermissions() {
  const query = useQuery({
    queryKey: PERMISSIONS_QUERY_KEY,
    queryFn: async () => {
      const res = await apiGetMyPermissions();
      return res.data as Permission[];
    },
    // Performance: Don't refetch on window focus for permissions — they rarely change.
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const permissionAtoms = new Set<string>(
    (query.data ?? []).map((p) => p.atom)
  );

  /**
   * Returns true if the current user has the given permission atom.
   * Security: Always checks against the server-fetched list, not local state.
   */
  function hasPermission(atom: string): boolean {
    return permissionAtoms.has(atom);
  }

  return {
    permissions: query.data ?? [],
    permissionAtoms,
    hasPermission,
    isLoading: query.isLoading,
    isError: query.isError,
  };
}
