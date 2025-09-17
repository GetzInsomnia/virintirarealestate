import type { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';

import { prisma } from '@/lib/prisma';
import { requireAdminAuth } from '@/lib/admin/apiAuth';
import {
  BCRYPT_ROUNDS,
  isDbAuthEnabled,
  toAdminUserDto,
  type AdminUserDto,
} from '@/lib/admin/userUtils';
import { logAuditEvent } from '@/lib/logging/audit';

type ResponseBody =
  | { ok: true; user: AdminUserDto; message: string; dbAuthEnabled: boolean }
  | { error: string };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseBody>,
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const session = requireAdminAuth(req, res);
  if (!session) return;

  const envUser = process.env.ADMIN_USER;
  if (!envUser) {
    res.status(400).json({ error: 'No ADMIN_USER configured' });
    return;
  }

  let passwordHash = process.env.ADMIN_HASH;
  if (!passwordHash) {
    const envPassword = process.env.ADMIN_PASSWORD;
    if (!envPassword) {
      res
        .status(400)
        .json({ error: 'ADMIN_PASSWORD or ADMIN_HASH must be configured to migrate' });
      return;
    }
    passwordHash = await bcrypt.hash(envPassword, BCRYPT_ROUNDS);
  }

  try {
    const user = await prisma.user.upsert({
      where: { username: envUser },
      update: {
        passwordHash,
        isActive: true,
      },
      create: {
        username: envUser,
        passwordHash,
        isActive: true,
      },
    });

    await logAuditEvent({
      actor: session.username,
      action: 'admin_user_migrate_env',
      result: 'success',
      details: { username: envUser },
    });

    const message =
      'Environment admin migrated. Enable ADMIN_DB_AUTH_ENABLED to activate database login.';

    res.status(200).json({
      ok: true,
      user: toAdminUserDto(user),
      message,
      dbAuthEnabled: isDbAuthEnabled(),
    });
  } catch (error) {
    console.error('Failed to migrate env admin to database', error);
    await logAuditEvent({
      actor: session.username,
      action: 'admin_user_migrate_env',
      result: 'failure',
      reason: 'exception',
      details: { username: envUser },
    });
    res.status(500).json({ error: 'Unable to migrate admin user' });
  }
}
