"use client";

/**
 * Wraps the app in TanStack QueryClientProvider.
 * Defined as a separate client component so the root layout can remain a Server Component.
 */

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  // Each browser session gets one QueryClient — stable across navigations.
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Performance: retry once on failure, stale after 60s
            retry: 1,
            staleTime: 60 * 1000,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
