import fs from 'fs/promises';
import path from 'path';

export interface AuditEvent {
  timestamp?: string;
  actor: string;
  action: string;
  result: 'success' | 'failure';
  ip?: string;
  reason?: string;
  details?: Record<string, unknown>;
}

const auditLogPath = path.join(process.cwd(), 'logs', 'audit.log');

export async function logAuditEvent(event: AuditEvent): Promise<void> {
  const entry = {
    ...event,
    timestamp: event.timestamp ?? new Date().toISOString(),
  };

  try {
    await fs.mkdir(path.dirname(auditLogPath), { recursive: true });
    await fs.appendFile(auditLogPath, `${JSON.stringify(entry)}\n`, { encoding: 'utf8' });
  } catch (error) {
    console.error('Failed to write audit log entry', error);
  }
}
