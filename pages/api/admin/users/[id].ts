import type { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';

import { prisma } from '@/lib/prisma';
import { requireAdminAuth } from '@/lib/admin/apiAuth';
import {
  BCRYPT_ROUNDS,
  normalizeBoolean,
  toAdminUserDto,
  type AdminUserDto,
} from '@/lib/admin/userUtils';
import { logAuditEvent } from '@/lib/logging/audit';

type ResponseBody = { ok: true; user: AdminUserDto } | { error: string };

interface UpdateRequestBody {
  password?: unknown;
  isActive?: unknown;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseBody>,
) {
  if (req.method !== 'PUT' && req.method !== 'PATCH') {
    res.setHeader('Allow', 'PUT,PATCH');
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const session = requireAdminAuth(req, res);
  if (!session) return;

  const id = Number.parseInt(String(req.query.id), 10);
  if (!Number.isFinite(id)) {
    res.status(400).json({ error: 'Invalid user id' });
    return;
  }

  const body = (req.body ?? {}) as UpdateRequestBody;
  const updates: Record<string, unknown> = {};

  if (body.password !== undefined) {
    const password = typeof body.password === 'string' ? body.password : '';
    if (password && password.length < 8) {
      res.status(400).json({ error: 'Password must be at least 8 characters long' });
      return;
    }
    if (password) {
      updates.passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    }
  }

  if (body.isActive !== undefined) {
    updates.isActive = normalizeBoolean(body.isActive);
  }

  if (Object.keys(updates).length === 0) {
    res.status(400).json({ error: 'No updates provided' });
    return;
  }

  try {
    const user = await prisma.user.update({
      where: { id },
      data: updates,
    });

    await logAuditEvent({
      actor: session.username,
      action: 'admin_user_update',
      result: 'success',
      details: { id, updates: Object.keys(updates) },
    });

    res.status(200).json({ ok: true, user: toAdminUserDto(user) });
  } catch (error) {
    console.error('Failed to update admin user', error);
    await logAuditEvent({
      actor: session.username,
      action: 'admin_user_update',
      result: 'failure',
      reason: 'exception',
      details: { id },
    });
    res.status(500).json({ error: 'Unable to update user' });
  }
}
