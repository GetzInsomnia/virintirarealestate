export interface AdminUserDto {
  id: number;
  username: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const BCRYPT_ROUNDS = 10;

export function normalizeBoolean(value: unknown): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    return ['1', 'true', 'yes', 'on'].includes(normalized);
  }
  return false;
}

export function isDbAuthEnabled(): boolean {
  const flag = process.env.ADMIN_DB_AUTH_ENABLED ?? process.env.ADMIN_DB_AUTH ?? '';
  return ['1', 'true', 'yes', 'on'].includes(flag.trim().toLowerCase());
}

export function toAdminUserDto(user: {
  id: number;
  username: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}): AdminUserDto {
  return {
    id: user.id,
    username: user.username,
    isActive: user.isActive,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}
