import fs from 'fs/promises';
import path from 'path';

import { prisma } from '@/src/lib/prisma';

export interface AuditEvent {
  timestamp?: string;
  actor: string;
  action: string;
  result: 'success' | 'failure';
  ip?: string;
  reason?: string;
  details?: Record<string, unknown>;
  publishJobId?: number;
}

const auditLogPath = path.join(process.cwd(), 'logs', 'audit.log');

export async function logAuditEvent(event: AuditEvent): Promise<void> {
  const entry = {
    ...event,
    timestamp: event.timestamp ?? new Date().toISOString(),
  };

  const createdAt = new Date(entry.timestamp);
  const detailsString =
    entry.details === undefined ? undefined : JSON.stringify(entry.details);

  try {
    await prisma.auditLog.create({
      data: {
        actor: entry.actor,
        action: entry.action,
        result: entry.result,
        ip: entry.ip,
        reason: entry.reason,
        details: detailsString,
        publishJobId: entry.publishJobId,
        createdAt: Number.isNaN(createdAt.getTime()) ? undefined : createdAt,
      },
    });
  } catch (error) {
    console.error('Failed to write audit log entry to database', error);
  }

  try {
    await fs.mkdir(path.dirname(auditLogPath), { recursive: true });
    await fs.appendFile(auditLogPath, `${JSON.stringify(entry)}\n`, { encoding: 'utf8' });
  } catch (error) {
    console.error('Failed to write audit log entry', error);
  }
}
