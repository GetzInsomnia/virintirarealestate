import type { NextApiRequest, NextApiResponse } from 'next';

import { prisma } from '@/src/lib/prisma';
import { requireAdminAuth } from '@/src/lib/admin/apiAuth';

interface PublishJobLogDto {
  id: number;
  createdAt: string;
  actor: string;
  action: string;
  result?: string | null;
  reason?: string | null;
  details?: Record<string, unknown> | string | null;
}

interface PublishJobDto {
  id: number;
  status: string;
  queuedAt: string;
  startedAt?: string | null;
  completedAt?: string | null;
  failedAt?: string | null;
  attempts: number;
  changeSet?: {
    id: number;
    description?: string | null;
    createdAt: string;
  } | null;
  logs: PublishJobLogDto[];
}

type ResponseBody = { jobs: PublishJobDto[] } | { error: string };

function parseDetails(details: string | null): Record<string, unknown> | string | null {
  if (!details) return details;
  try {
    const parsed = JSON.parse(details);
    if (parsed && typeof parsed === 'object') {
      return parsed as Record<string, unknown>;
    }
    return parsed;
  } catch {
    return details;
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseBody>,
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const session = requireAdminAuth(req, res);
  if (!session) return;

  const jobs = await prisma.publishJob.findMany({
    orderBy: { queuedAt: 'desc' },
    include: {
      changeSet: {
        select: {
          id: true,
          description: true,
          createdAt: true,
        },
      },
      logs: {
        orderBy: { createdAt: 'desc' },
        take: 25,
      },
    },
    take: 25,
  });

  res.status(200).json({
    jobs: jobs.map((job) => ({
      id: job.id,
      status: job.status,
      queuedAt: job.queuedAt.toISOString(),
      startedAt: job.startedAt ? job.startedAt.toISOString() : null,
      completedAt: job.completedAt ? job.completedAt.toISOString() : null,
      failedAt: job.failedAt ? job.failedAt.toISOString() : null,
      attempts: job.attempts,
      changeSet: job.changeSet
        ? {
            id: job.changeSet.id,
            description: job.changeSet.description,
            createdAt: job.changeSet.createdAt.toISOString(),
          }
        : null,
      logs: job.logs.map((log) => ({
        id: log.id,
        createdAt: log.createdAt.toISOString(),
        actor: log.actor,
        action: log.action,
        result: log.result,
        reason: log.reason,
        details: parseDetails(log.details ?? null),
      })),
    })),
  });
}
