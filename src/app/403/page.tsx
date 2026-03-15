"use client";

/**
 * @fileoverview 403 Access Denied page.
 * Shown when a user navigates to a route they don't have permission for.
 */

import Link from "next/link";
import { ShieldOff, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ForbiddenPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/20 p-6">
      <div className="text-center max-w-sm animate-fade-in">
        <div className="mx-auto w-20 h-20 rounded-2xl bg-red-50 flex items-center justify-center mb-6">
          <ShieldOff size={40} className="text-destructive" />
        </div>
        <h1 className="text-5xl font-black text-foreground mb-2">403</h1>
        <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
        <p className="text-muted-foreground text-sm leading-relaxed mb-8">
          You don&apos;t have the required permissions to view this page.
          Contact your administrator if you believe this is a mistake.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/dashboard">
            <Button className="gradient-obliq border-0 text-white hover:opacity-90 w-full sm:w-auto">
              <ArrowLeft size={15} className="mr-1.5" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
