/**
 * @fileoverview API type definitions.
 * Hand-crafted from backend DTOs since the server may not be running during build.
 * Regenerate from Swagger with: npm run generate:api
 */

// ─── Common Response Wrapper ────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  statusCode: number;
  message: string;
  data: T;
}

export interface ApiError {
  statusCode: number;
  message: string;
  error?: string;
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RefreshRequest {
  refreshToken: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export type LoginResponse = ApiResponse<AuthTokens>;
export type LogoutResponse = ApiResponse<null>;

// ─── Users ───────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  name: string;
  isSuspended?: boolean;
  isBanned?: boolean;
  role?: Role;
  permissions?: UserPermission[];
}

export interface Role {
  id: string;
  name: string;
}

export interface UserPermission {
  id: string;
  userId: string;
  permissionId: string;
  grantedBy?: string;
  permission: Permission;
}

export interface CreateUserRequest {
  email: string;
  name: string;
  password: string;
}

export interface UpdateUserRequest {
  email?: string;
  name?: string;
}

export interface UpdatePermissionsRequest {
  permissions: string[]; // array of permission atoms e.g. "users.read"
}

export type GetUsersResponse = ApiResponse<User[]>;
export type GetUserResponse = ApiResponse<User>;

// ─── Permissions ─────────────────────────────────────────────────────────────

export interface Permission {
  id: string;
  atom: string;        // e.g. "users.read"
  description?: string;
  module?: string;
}

export type GetPermissionsResponse = ApiResponse<Permission[]>;

// ─── Audit ───────────────────────────────────────────────────────────────────

export interface AuditLog {
  id: string;
  actorId: string;
  actorName?: string;
  action: string;
  resource?: string;
  resourceId?: string;
  detail?: string;
  createdAt: string;
}

export type GetAuditLogsResponse = ApiResponse<AuditLog[]>;

// ─── Navigation / Permissions Map ────────────────────────────────────────────

/**
 * Maps each sidebar route to the permission atom that gates it.
 * If undefined, the route is always visible to authenticated users.
 */
export const ROUTE_PERMISSIONS: Record<string, string | undefined> = {
  '/dashboard':        undefined,
  '/users':            'users.read',
  '/leads':            undefined,
  '/tasks':            undefined,
  '/reports':          undefined,
  '/audit':            'audit.read',
  '/customer-portal':  undefined,
  '/settings':         'settings.manage',
};
