import type { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';

import { prisma } from '@/src/lib/prisma';
import { requireAdminAuth } from '@/src/lib/admin/apiAuth';
import { logAuditEvent } from '@/src/lib/logging/audit';
import {
  BCRYPT_ROUNDS,
  isDbAuthEnabled,
  normalizeBoolean,
  toAdminUserDto,
  type AdminUserDto,
} from '@/src/lib/admin/userUtils';

interface UsersResponse {
  users: AdminUserDto[];
  dbAuthEnabled: boolean;
  migratableEnvAdmin: boolean;
}

interface CreateUserRequest {
  username?: unknown;
  password?: unknown;
  isActive?: unknown;
}

type ResponseBody = UsersResponse | { ok: true; user: AdminUserDto } | { error: string };

async function handleGet(req: NextApiRequest, res: NextApiResponse<ResponseBody>) {
  const session = requireAdminAuth(req, res);
  if (!session) return;

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
  });

  const envUser = process.env.ADMIN_USER;
  const migratableEnvAdmin = Boolean(
    envUser && (process.env.ADMIN_HASH || process.env.ADMIN_PASSWORD),
  );

  res.status(200).json({
    users: users.map(toAdminUserDto),
    dbAuthEnabled: isDbAuthEnabled(),
    migratableEnvAdmin,
  });
}

async function handlePost(req: NextApiRequest, res: NextApiResponse<ResponseBody>) {
  const session = requireAdminAuth(req, res);
  if (!session) return;

  const body = (req.body ?? {}) as CreateUserRequest;
  const username = typeof body.username === 'string' ? body.username.trim() : '';
  const password = typeof body.password === 'string' ? body.password : '';
  const isActive = normalizeBoolean(body.isActive ?? true);

  if (!username || username.length < 3) {
    res.status(400).json({ error: 'Username must be at least 3 characters long' });
    return;
  }

  if (password.length < 8) {
    res.status(400).json({ error: 'Password must be at least 8 characters long' });
    return;
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  try {
    const user = await prisma.user.create({
      data: {
        username,
        passwordHash,
        isActive,
      },
    });

    await logAuditEvent({
      actor: session.username,
      action: 'admin_user_create',
      result: 'success',
      details: { username, isActive },
    });

    res.status(201).json({ ok: true, user: toAdminUserDto(user) });
  } catch (error: any) {
    if (error?.code === 'P2002') {
      res.status(409).json({ error: 'Username already exists' });
      return;
    }

    console.error('Failed to create admin user', error);
    await logAuditEvent({
      actor: session.username,
      action: 'admin_user_create',
      result: 'failure',
      reason: 'exception',
      details: { username },
    });
    res.status(500).json({ error: 'Unable to create user' });
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseBody>,
) {
  if (req.method === 'GET') {
    await handleGet(req, res);
    return;
  }

  if (req.method === 'POST') {
    await handlePost(req, res);
    return;
  }

  res.setHeader('Allow', 'GET,POST');
  res.status(405).json({ error: 'Method not allowed' });
}
