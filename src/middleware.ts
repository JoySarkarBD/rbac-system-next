/**
 * @fileoverview Next.js middleware for route protection.
 *
 * Runs on the Edge Runtime before every request.
 * Checks for the auth_token cookie and redirects accordingly:
 * - No token + protected route → /login
 * - Has token + /login → /dashboard (avoid landing back on login)
 *
 * Security: Fine-grained permission checks (e.g. users.read) happen
 * client-side via usePermissions() because calling the backend from
 * Edge middleware would add latency and require a network hop on every req.
 * The server validates the JWT on every protected API call anyway.
 */

import { NextRequest, NextResponse } from "next/server";

// Routes that don't require authentication
const PUBLIC_ROUTES = ["/login", "/403"];

// Prefix that every protected route starts with (the route group folder name is stripped by Next)
const PROTECTED_PREFIX = ["/dashboard", "/users", "/leads", "/tasks", "/reports", "/audit", "/customer-portal", "/settings"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow Next.js internal routes and static files through immediately
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get("auth_token")?.value;
  const isPublicRoute = PUBLIC_ROUTES.some((r) => pathname.startsWith(r));
  const isProtectedRoute = PROTECTED_PREFIX.some((r) => pathname.startsWith(r));

  // Redirect unauthenticated users trying to access protected routes
  if (!token && isProtectedRoute) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users away from the login page
  if (token && pathname.startsWith("/login")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Redirect root to dashboard or login
  if (pathname === "/") {
    return NextResponse.redirect(
      new URL(token ? "/dashboard" : "/login", request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  // Run middleware on these paths only — exclude static files
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
