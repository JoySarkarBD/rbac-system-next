/**
 * @fileoverview API client.
 *
 * Uses openapi-fetch for type-safe HTTP calls against the NestJS backend.
 * Token is stored in localStorage (client-side) and attached to every request
 * via a middleware function. Server middleware uses the auth_token cookie.
 *
 * Security: Tokens stored in localStorage are accessible to JS — acceptable
 * for an internal admin tool. For public-facing apps, prefer httpOnly cookies.
 */

import createClient from "openapi-fetch";
import type {
  LoginRequest,
  LoginResponse,
  LogoutResponse,
  RefreshRequest,
  GetUsersResponse,
  GetUserResponse,
  CreateUserRequest,
  UpdateUserRequest,
  UpdatePermissionsRequest,
  GetPermissionsResponse,
  GetAuditLogsResponse,
  ApiResponse,
} from "@/types/api";

// ─── Constants ───────────────────────────────────────────────────────────────

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
const TOKEN_KEY = "auth_token";
const REFRESH_KEY = "refresh_token";

// ─── Token Helpers ───────────────────────────────────────────────────────────

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setTokens(access: string, refresh: string): void {
  localStorage.setItem(TOKEN_KEY, access);
  localStorage.setItem(REFRESH_KEY, refresh);
  // Also set cookie for middleware route protection
  document.cookie = `auth_token=${access}; path=/; SameSite=Strict`;
}

export function clearTokens(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
  // Expire the cookie
  document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_KEY);
}

// ─── openapi-fetch Client (untyped paths — we wrap manually below) ────────────

/**
 * Raw client. We use untyped paths because the OpenAPI spec cannot be
 * generated at build time (server may be offline). All calls go through
 * the typed wrapper functions below instead.
 *
 * Performance: A single client instance is reused for all requests.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const client = createClient<any>({ baseUrl: API_BASE_URL });

/**
 * Returns Authorization header if a token exists.
 * Security: Token is always read fresh from localStorage to pick up
 * any refresh that may have happened in another tab.
 */
function authHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ─── Typed API Wrapper Functions ─────────────────────────────────────────────

// Auth

export async function apiLogin(body: LoginRequest): Promise<LoginResponse> {
  const { data, error } = await client.POST("/api/auth/login", { body });
  if (error) throw error;
  return data as LoginResponse;
}

export async function apiRefresh(body: RefreshRequest): Promise<LoginResponse> {
  const { data, error } = await client.POST("/api/auth/refresh", { body });
  if (error) throw error;
  return data as LoginResponse;
}

export async function apiLogout(): Promise<LogoutResponse> {
  const { data, error } = await client.POST("/api/auth/logout", {
    headers: authHeaders(),
  });
  if (error) throw error;
  return data as LogoutResponse;
}

// Users

export async function apiGetUsers(): Promise<GetUsersResponse> {
  const { data, error } = await client.GET("/api/users", {
    headers: authHeaders(),
  });
  if (error) throw error;
  return data as GetUsersResponse;
}

export async function apiGetUser(id: string): Promise<GetUserResponse> {
  const { data, error } = await client.GET(`/api/users/${id}`, {
    headers: authHeaders(),
  });
  if (error) throw error;
  return data as GetUserResponse;
}

export async function apiCreateUser(body: CreateUserRequest): Promise<GetUserResponse> {
  const { data, error } = await client.POST("/api/users", {
    headers: authHeaders(),
    body,
  });
  if (error) throw error;
  return data as GetUserResponse;
}

export async function apiUpdateUser(id: string, body: UpdateUserRequest): Promise<GetUserResponse> {
  const { data, error } = await client.PUT(`/api/users/${id}`, {
    headers: authHeaders(),
    body,
  });
  if (error) throw error;
  return data as GetUserResponse;
}

export async function apiSuspendUser(id: string): Promise<GetUserResponse> {
  const { data, error } = await client.PATCH(`/api/users/${id}/suspend`, {
    headers: authHeaders(),
  });
  if (error) throw error;
  return data as GetUserResponse;
}

export async function apiBanUser(id: string): Promise<GetUserResponse> {
  const { data, error } = await client.PATCH(`/api/users/${id}/ban`, {
    headers: authHeaders(),
  });
  if (error) throw error;
  return data as GetUserResponse;
}

export async function apiUpdateUserPermissions(
  id: string,
  body: UpdatePermissionsRequest
): Promise<ApiResponse<null>> {
  const { data, error } = await client.PUT(`/api/users/${id}/permissions`, {
    headers: authHeaders(),
    body,
  });
  if (error) throw error;
  return data as ApiResponse<null>;
}

// Permissions

export async function apiGetMyPermissions(): Promise<GetPermissionsResponse> {
  const { data, error } = await client.GET("/api/me/permissions", {
    headers: authHeaders(),
  });
  if (error) throw error;
  return data as GetPermissionsResponse;
}

export async function apiGetAllPermissions(): Promise<GetPermissionsResponse> {
  const { data, error } = await client.GET("/api/permissions", {
    headers: authHeaders(),
  });
  if (error) throw error;
  return data as GetPermissionsResponse;
}

// Audit

export async function apiGetAuditLogs(): Promise<GetAuditLogsResponse> {
  const { data, error } = await client.GET("/api/audit-logs", {
    headers: authHeaders(),
  });
  if (error) throw error;
  return data as GetAuditLogsResponse;
}
