"use client";

/**
 * @fileoverview Protected route layout.
 *
 * Wraps all dashboard pages in a sidebar + main area layout.
 * On mount, verifies a token exists in localStorage; if not, redirects to
 * /login. This is a belt-and-suspenders check alongside the middleware cookie check.
 */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "@/lib/api";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [userName, setUserName] = useState("Admin");
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace("/login");
      return;
    }

    // Decode the JWT payload to get user info (no verification needed here — server validates)
    try {
      const payload = JSON.parse(atob(token.split(".")[1]!));
      setUserName(payload.name ?? payload.email ?? "Admin");
      setUserEmail(payload.email ?? "");
    } catch {
      // Token malformed — redirect to login
      router.replace("/login");
      return;
    }

    setReady(true);
  }, [router]);

  if (!ready) {
    return (
      <div className="flex h-screen items-center justify-center bg-muted/30">
        <div className="space-y-3 w-64">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-muted/20">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header userName={userName} userEmail={userEmail} />
        <main className="flex-1 overflow-y-auto p-6 animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}
