import { spawn } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { Prisma } from '@prisma/client';

import { prisma } from '@/src/lib/prisma';
import { logAuditEvent } from '@/src/lib/logging/audit';

type PublishJobWithChangeSet = Prisma.PublishJobGetPayload<{
  include: { changeSet: true };
}>;

type FilePatchOperation = {
  relativePath: string;
  absolutePath: string;
  format: 'json' | 'text';
  content: unknown;
};

type FilePatchBackup = {
  path: string;
  content: Buffer | null;
};

type AppliedPatchResult = {
  operations: FilePatchOperation[];
  rollback: () => Promise<void>;
};

const JOB_STATUS = {
  QUEUED: 'QUEUED',
  PROCESSING: 'PROCESSING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
} as const;

class IndexBuildError extends Error {
  readonly stdout: string;
  readonly stderr: string;
  readonly exitCode: number | null;

  constructor(message: string, stdout: string, stderr: string, exitCode: number | null) {
    super(message);
    this.name = 'IndexBuildError';
    this.stdout = stdout;
    this.stderr = stderr;
    this.exitCode = exitCode;
  }
}

const DEFAULT_POLL_INTERVAL_MS = 15_000;

let pollTimer: NodeJS.Timeout | null = null;
let isProcessing = false;

function resolvePollInterval(): number {
  const raw = process.env.PUBLISH_JOB_POLL_INTERVAL_MS;
  if (!raw) return DEFAULT_POLL_INTERVAL_MS;
  const parsed = Number.parseInt(raw, 10);
  if (Number.isNaN(parsed) || parsed <= 0) {
    return DEFAULT_POLL_INTERVAL_MS;
  }
  return parsed;
}

function normalizePatch(changeSet: PublishJobWithChangeSet['changeSet']): FilePatchOperation[] {
  let rawPatch: unknown = changeSet.patch;

  if (typeof rawPatch === 'string') {
    const trimmed = rawPatch.trim();
    if (!trimmed) {
      return [];
    }
    try {
      rawPatch = JSON.parse(trimmed);
    } catch (error) {
      throw new Error('ChangeSet patch contains invalid JSON');
    }
  }

  if (!rawPatch || typeof rawPatch !== 'object' || Array.isArray(rawPatch)) {
    throw new Error('ChangeSet patch must be an object with a "files" array');
  }

  const files = (rawPatch as Record<string, unknown>).files;
  if (!Array.isArray(files) || files.length === 0) {
    return [];
  }

  const repoRoot = process.cwd();
  const operations: FilePatchOperation[] = [];

  files.forEach((file, index) => {
    if (!file || typeof file !== 'object' || Array.isArray(file)) {
      throw new Error(`ChangeSet file patch at index ${index} must be an object`);
    }

    const entry = file as Record<string, unknown>;
    const pathValue = entry.path;
    if (typeof pathValue !== 'string' || pathValue.trim().length === 0) {
      throw new Error(`ChangeSet file patch at index ${index} is missing a valid path`);
    }

    const formatValue = entry.format;
    const format = formatValue === 'text' ? 'text' : 'json';

    const content =
      entry.content ?? entry.data ?? entry.value ?? entry.payload ?? undefined;
    if (content === undefined) {
      throw new Error(
        `ChangeSet file patch for ${pathValue} is missing a "content" property`
      );
    }

    const relativePath = pathValue.replace(/^\.\//, '');
    const absolutePath = path.resolve(repoRoot, relativePath);
    if (
      absolutePath !== repoRoot &&
      !absolutePath.startsWith(`${repoRoot}${path.sep}`)
    ) {
      throw new Error(
        `ChangeSet file patch path "${pathValue}" resolves outside of the repository`
      );
    }

    operations.push({
      relativePath,
      absolutePath,
      format,
      content,
    });
  });

  return operations;
}

async function rollbackFileChanges(backups: FilePatchBackup[]): Promise<void> {
  for (const backup of backups.reverse()) {
    try {
      if (backup.content === null) {
        await fs.rm(backup.path, { force: true });
      } else {
        await fs.mkdir(path.dirname(backup.path), { recursive: true });
        await fs.writeFile(backup.path, backup.content);
      }
    } catch (error) {
      console.error('Failed to rollback file change', backup.path, error);
    }
  }
}

async function applyChangeSetPatch(
  changeSet: PublishJobWithChangeSet['changeSet']
): Promise<AppliedPatchResult> {
  const operations = normalizePatch(changeSet);
  if (operations.length === 0) {
    return { operations, rollback: async () => {} };
  }

  const backups: FilePatchBackup[] = [];

  try {
    for (const operation of operations) {
      let previous: Buffer | null = null;
      try {
        previous = await fs.readFile(operation.absolutePath);
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
          throw error;
        }
      }
      backups.push({ path: operation.absolutePath, content: previous });

      await fs.mkdir(path.dirname(operation.absolutePath), { recursive: true });
      let serialized: string | Buffer;
      if (operation.format === 'text') {
        serialized = String(operation.content ?? '');
      } else {
        serialized = `${JSON.stringify(operation.content, null, 2)}\n`;
      }
      await fs.writeFile(operation.absolutePath, serialized);
    }
  } catch (error) {
    await rollbackFileChanges(backups);
    throw error;
  }

  let rolledBack = false;
  return {
    operations,
    rollback: async () => {
      if (rolledBack) return;
      rolledBack = true;
      await rollbackFileChanges(backups);
    },
  };
}

async function runIndexBuild(): Promise<{ stdout: string; stderr: string }> {
  const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  return new Promise((resolve, reject) => {
    const child = spawn(npmCommand, ['run', 'index:build'], {
      cwd: process.cwd(),
      env: process.env,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';

    child.stdout?.on('data', (data: Buffer) => {
      stdout += data.toString();
    });
    child.stderr?.on('data', (data: Buffer) => {
      stderr += data.toString();
    });

    child.on('error', (error) => {
      reject(error);
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve({ stdout, stderr });
        return;
      }
      reject(
        new IndexBuildError(
          `index:build exited with code ${code}`,
          stdout,
          stderr,
          code
        )
      );
    });
  });
}

async function claimNextJob(): Promise<PublishJobWithChangeSet | null> {
  const startedAt = new Date();
  return prisma.$transaction(async (tx) => {
    const job = await tx.publishJob.findFirst({
      where: { status: JOB_STATUS.QUEUED },
      orderBy: { queuedAt: 'asc' },
      include: { changeSet: true },
    });

    if (!job) {
      return null;
    }

    const updateResult = await tx.publishJob.updateMany({
      where: { id: job.id, status: JOB_STATUS.QUEUED },
      data: {
        status: JOB_STATUS.PROCESSING,
        startedAt,
        attempts: job.attempts + 1,
      },
    });

    if (updateResult.count === 0) {
      return null;
    }

    return {
      ...job,
      status: JOB_STATUS.PROCESSING,
      startedAt,
      attempts: job.attempts + 1,
    } as PublishJobWithChangeSet;
  });
}

function sanitizeOutput(value: string): string | undefined {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

async function processNextPublishJob(): Promise<boolean> {
  const job = await claimNextJob();
  if (!job) {
    return false;
  }

  await logAuditEvent({
    actor: 'scheduler',
    action: 'publish_job_started',
    result: 'success',
    details: {
      jobId: job.id,
      changeSetId: job.changeSetId,
      attempts: job.attempts,
    },
    publishJobId: job.id,
  });

  let appliedPatch: AppliedPatchResult | null = null;

  try {
    appliedPatch = await applyChangeSetPatch(job.changeSet);
    const { operations } = appliedPatch;
    const buildOutput = await runIndexBuild();
    const completedAt = new Date();

    await prisma.$transaction([
      prisma.publishJob.update({
        where: { id: job.id },
        data: {
          status: JOB_STATUS.COMPLETED,
          completedAt,
          errorMessage: null,
        },
      }),
      prisma.changeSet.update({
        where: { id: job.changeSetId },
        data: {
          appliedAt: job.changeSet.appliedAt ?? completedAt,
        },
      }),
    ]);

    await logAuditEvent({
      actor: 'scheduler',
      action: 'publish_job_completed',
      result: 'success',
      details: {
        jobId: job.id,
        changeSetId: job.changeSetId,
        updatedFiles: operations.map((operation) => operation.relativePath),
        indexBuildStdout: sanitizeOutput(buildOutput.stdout),
        indexBuildStderr: sanitizeOutput(buildOutput.stderr),
      },
      publishJobId: job.id,
    });
  } catch (error) {
    if (appliedPatch) {
      try {
        await appliedPatch.rollback();
      } catch (rollbackError) {
        console.error('Failed to rollback applied patch', rollbackError);
      }
    }

    const failedAt = new Date();
    const message = error instanceof Error ? error.message : 'Unknown error';

    await prisma.publishJob.update({
      where: { id: job.id },
      data: {
        status: JOB_STATUS.FAILED,
        failedAt,
        errorMessage: message,
      },
    });

    const details: Record<string, unknown> = {
      jobId: job.id,
      changeSetId: job.changeSetId,
      error: message,
    };

    if (error instanceof IndexBuildError) {
      details.indexBuildStdout = sanitizeOutput(error.stdout);
      details.indexBuildStderr = sanitizeOutput(error.stderr);
      details.exitCode = error.exitCode;
    }

    await logAuditEvent({
      actor: 'scheduler',
      action: 'publish_job_failed',
      result: 'failure',
      reason: 'job_failed',
      details,
      publishJobId: job.id,
    });

    console.error(`Publish job ${job.id} failed`, error);
  }

  return true;
}

async function pollForJobs(): Promise<void> {
  if (isProcessing) {
    return;
  }
  isProcessing = true;
  try {
    while (await processNextPublishJob()) {
      // Continue processing queued jobs until none remain.
    }
  } catch (error) {
    console.error('Scheduler polling loop encountered an error', error);
  } finally {
    isProcessing = false;
  }
}

export function startScheduler(): void {
  if (pollTimer) {
    return;
  }

  const interval = resolvePollInterval();
  pollTimer = setInterval(() => {
    void pollForJobs();
  }, interval);

  void pollForJobs();
}
