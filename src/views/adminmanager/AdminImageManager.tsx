import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import Image from 'next/image'

import AdminLoginForm from '@/components/admin/AdminLoginForm'
import { useAdminAuth } from '@/context/AdminAuthContext'
import { ApiError, apiFetch, apiRequest } from '@/lib/api'

type WorkflowStatus = 'draft' | 'review' | 'scheduled' | 'published'

interface ChangeSetRecord {
  id: string
  title: string
  owner: string
  updatedAt: string
  status: WorkflowStatus
  scheduledFor?: string | null
  lastAction?: string
}

interface WorkflowAction {
  key: string
  label: string
  confirmTitle: string
  confirmMessage: string
  targetStatus?: WorkflowStatus
  requiresSchedule?: boolean
  variant?: 'primary' | 'danger' | 'ghost'
  type?: 'status' | 'duplicate'
}

interface ConfirmState {
  changeSet: ChangeSetRecord
  action: WorkflowAction
  scheduleAt?: string
  error?: string | null
}

interface ToastMessage {
  id: number
  tone: 'success' | 'error' | 'info'
  title: string
  description?: string
}

interface UploadResponse {
  webp: string
  avif: string
}

interface AdminUserDto {
  id: number
  username: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface UsersApiResponse {
  users: AdminUserDto[]
  dbAuthEnabled: boolean
  migratableEnvAdmin: boolean
}

interface SchedulerJobLogDto {
  id: number
  createdAt: string
  actor: string
  action: string
  result?: string | null
  reason?: string | null
  details?: Record<string, unknown> | string | null
}

interface SchedulerJobDto {
  id: number
  status: string
  queuedAt: string
  startedAt?: string | null
  completedAt?: string | null
  failedAt?: string | null
  attempts: number
  changeSet?: {
    id: number
    description?: string | null
    createdAt: string
  } | null
  logs: SchedulerJobLogDto[]
}

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']

const workflowActions: Record<WorkflowStatus, WorkflowAction[]> = {
  draft: [
    {
      key: 'submit',
      label: 'Send to review',
      confirmTitle: 'Send draft to review',
      confirmMessage:
        'This will notify reviewers to begin QA on the change set. Continue?',
      targetStatus: 'review',
      variant: 'primary',
    },
    {
      key: 'publish',
      label: 'Publish now',
      confirmTitle: 'Publish draft immediately',
      confirmMessage: 'This change set will go live immediately.',
      targetStatus: 'published',
      variant: 'danger',
    },
  ],
  review: [
    {
      key: 'approve',
      label: 'Approve & schedule',
      confirmTitle: 'Schedule publication',
      confirmMessage:
        'Choose when this change set should go live. The scheduler will queue it automatically.',
      targetStatus: 'scheduled',
      requiresSchedule: true,
      variant: 'primary',
    },
    {
      key: 'publish',
      label: 'Publish now',
      confirmTitle: 'Publish from review',
      confirmMessage: 'Bypass scheduling and publish immediately?',
      targetStatus: 'published',
      variant: 'danger',
    },
    {
      key: 'return',
      label: 'Request edits',
      confirmTitle: 'Return to draft',
      confirmMessage: 'Send feedback and move this change set back to draft?',
      targetStatus: 'draft',
      variant: 'ghost',
    },
  ],
  scheduled: [
    {
      key: 'publish',
      label: 'Publish now',
      confirmTitle: 'Publish scheduled change',
      confirmMessage: 'Publish immediately and clear the schedule?',
      targetStatus: 'published',
      variant: 'primary',
    },
    {
      key: 'reschedule',
      label: 'Reschedule',
      confirmTitle: 'Reschedule publication',
      confirmMessage: 'Select a new go-live time for this change set.',
      targetStatus: 'scheduled',
      requiresSchedule: true,
      variant: 'ghost',
    },
    {
      key: 'cancel',
      label: 'Cancel schedule',
      confirmTitle: 'Cancel scheduled run',
      confirmMessage: 'This will move the change set back to review. Proceed?',
      targetStatus: 'review',
      variant: 'ghost',
    },
  ],
  published: [
    {
      key: 'duplicate',
      label: 'Create follow-up draft',
      confirmTitle: 'Create follow-up draft',
      confirmMessage:
        'Duplicate this change set back into draft so you can iterate further?',
      type: 'duplicate',
      variant: 'primary',
    },
  ],
}

const statusLabels: Record<WorkflowStatus, string> = {
  draft: 'Draft',
  review: 'In Review',
  scheduled: 'Scheduled',
  published: 'Published',
}

const statusStyles: Record<WorkflowStatus, string> = {
  draft: 'bg-slate-200 text-slate-800',
  review: 'bg-blue-100 text-blue-700',
  scheduled: 'bg-purple-100 text-purple-700',
  published: 'bg-emerald-100 text-emerald-700',
}

const tabs: {
  id: 'pipeline' | 'users' | 'scheduler' | 'uploads' | 'settings'
  label: string
  description: string
}[] = [
  {
    id: 'pipeline',
    label: 'Content pipeline',
    description: 'Manage drafts through review, schedule, and publish.',
  },
  {
    id: 'users',
    label: 'Admin users',
    description: 'Control workspace access and migrate credentials.',
  },
  {
    id: 'scheduler',
    label: 'Scheduler logs',
    description: 'Audit the automation queue and publishing jobs.',
  },
  {
    id: 'uploads',
    label: 'Asset uploads',
    description: 'Upload marketing imagery and delivery variants.',
  },
  {
    id: 'settings',
    label: 'Settings',
    description: 'Download data backups and review workspace operations.',
  },
]

const initialChangeSets: ChangeSetRecord[] = [
  {
    id: 'CS-1042',
    title: 'Bangkok luxury condos Q1 refresh',
    owner: 'Maya N.',
    status: 'draft',
    updatedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    lastAction: 'Editing hero copy',
  },
  {
    id: 'CS-1039',
    title: 'Samui villas launch campaign',
    owner: 'Alex T.',
    status: 'review',
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    lastAction: 'Awaiting photography approval',
  },
  {
    id: 'CS-1033',
    title: 'Phuket rentals SEO uplift',
    owner: 'Jamie L.',
    status: 'scheduled',
    scheduledFor: new Date(Date.now() + 1000 * 60 * 60 * 22).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    lastAction: 'Approved by marketing lead',
  },
  {
    id: 'CS-1021',
    title: 'Bangkok buyer guide refresh',
    owner: 'Pat R.',
    status: 'published',
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    lastAction: 'Published via scheduler',
  },
]

function toDatetimeLocal(date: Date): string {
  const iso = date.toISOString()
  return iso.slice(0, 16)
}

function formatDate(value?: string | null): string {
  if (!value) return '—'
  try {
    const formatter = new Intl.DateTimeFormat(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
    return formatter.format(new Date(value))
  } catch {
    return value
  }
}

function formatRelative(value: string): string {
  const formatter = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' })
  const updatedAt = new Date(value).getTime()
  const diffMs = updatedAt - Date.now()
  const diffMinutes = Math.round(diffMs / (1000 * 60))
  if (Math.abs(diffMinutes) < 60) {
    return formatter.format(Math.round(diffMinutes), 'minutes')
  }
  const diffHours = Math.round(diffMs / (1000 * 60 * 60))
  if (Math.abs(diffHours) < 48) {
    return formatter.format(diffHours, 'hours')
  }
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24))
  return formatter.format(diffDays, 'days')
}

function getFilenameFromDisposition(header: string | null): string | null {
  if (!header) return null
  const utfMatch = header.match(/filename\*=UTF-8''([^;]+)/i)
  if (utfMatch?.[1]) {
    try {
      return decodeURIComponent(utfMatch[1])
    } catch {
      return utfMatch[1]
    }
  }
  const basicMatch = header.match(/filename="?([^";]+)"?/i)
  if (basicMatch?.[1]) {
    return basicMatch[1]
  }
  return null
}
function useToastQueue(): [
  ToastMessage[],
  (toast: Omit<ToastMessage, 'id'>) => void,
  (id: number) => void,
] {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const push = useCallback(
    (toast: Omit<ToastMessage, 'id'>) => {
      const id = Math.random()
      setToasts((current) => [...current, { ...toast, id }])
      const duration = toast.tone === 'error' ? 8000 : 5000
      if (typeof window !== 'undefined') {
        window.setTimeout(() => {
          dismiss(id)
        }, duration)
      }
    },
    [dismiss],
  )

  return [toasts, push, dismiss]
}

function ToastContainer({
  toasts,
  onDismiss,
}: {
  toasts: ToastMessage[]
  onDismiss: (id: number) => void
}) {
  const toneStyles: Record<ToastMessage['tone'], string> = {
    success: 'border-emerald-300 bg-emerald-50 text-emerald-800',
    error: 'border-red-300 bg-red-50 text-red-800',
    info: 'border-blue-300 bg-blue-50 text-blue-800',
  }
  return (
    <div className="pointer-events-none fixed top-24 right-6 z-50 flex max-w-sm flex-col gap-3">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto rounded border px-4 py-3 shadow ${toneStyles[toast.tone]}`}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-semibold">{toast.title}</p>
              {toast.description && (
                <p className="mt-1 text-sm opacity-80">{toast.description}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              className="text-xs uppercase tracking-wide opacity-70 transition hover:opacity-100"
            >
              Dismiss
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
function ConfirmDialog({
  state,
  onCancel,
  onConfirm,
  onScheduleChange,
}: {
  state: ConfirmState | null
  onCancel: () => void
  onConfirm: () => void
  onScheduleChange: (value?: string) => void
}) {
  if (!state) return null

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-lg rounded bg-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold">{state.action.confirmTitle}</h2>
        <p className="mt-2 text-sm text-slate-600">{state.action.confirmMessage}</p>
        {state.action.requiresSchedule && (
          <div className="mt-4">
            <label className="text-sm font-medium text-slate-700">Schedule time</label>
            <input
              type="datetime-local"
              value={state.scheduleAt ?? ''}
              onChange={(event) => onScheduleChange(event.target.value || undefined)}
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
            />
            {state.error && (
              <p className="mt-1 text-xs text-red-600">{state.error}</p>
            )}
          </div>
        )}
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  )
}
function AssetUploadPanel({
  showToast,
}: {
  showToast: (toast: Omit<ToastMessage, 'id'>) => void
}) {
  const { isAuthenticated } = useAdminAuth()
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<UploadResponse | null>(null)
  const [propertyId, setPropertyId] = useState('')

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!isAuthenticated) {
      setError('You must be signed in to upload assets.')
      showToast({
        tone: 'error',
        title: 'Upload blocked',
        description: 'Please sign in again to upload property imagery.',
      })
      return
    }

    const trimmedId = propertyId.trim()
    if (!trimmedId) {
      setError('Enter the property ID the asset belongs to.')
      return
    }

    const form = event.currentTarget
    const fileInput = form.elements.namedItem('file') as HTMLInputElement | null
    const file = fileInput?.files?.[0]

    if (!file) {
      setError('Select a file to upload')
      return
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Upload JPEG, PNG, WebP, or AVIF assets only')
      return
    }
    if (file.size > MAX_FILE_SIZE) {
      setError('File is too large. Maximum size is 5MB.')
      return
    }

    const data = new FormData()
    data.append('file', file)

    try {
      setIsUploading(true)
      setError(null)
      const response = await apiFetch(`/v1/properties/${encodeURIComponent(trimmedId)}/images`, {
        method: 'POST',
        body: data,
      })
      if (!response.ok) {
        const message = await response
          .json()
          .then((payload) => payload?.error ?? 'Upload failed')
          .catch(() => 'Upload failed')
        throw new Error(message)
      }
      const payload = (await response.json()) as UploadResponse
      setResult(payload)
      showToast({
        tone: 'success',
        title: 'Upload complete',
        description: 'WebP and AVIF variants generated successfully.',
      })
    } catch (err: any) {
      const message = err?.message ?? 'Upload failed'
      setError(message)
      setResult(null)
      showToast({ tone: 'error', title: 'Upload failed', description: message })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="rounded border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Asset upload manager</h2>
          <p className="mt-1 text-sm text-slate-600">
            Drop hero imagery here to generate WebP and AVIF variants instantly.
          </p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase text-slate-600">
          CDN-ready
        </span>
      </div>
      <form onSubmit={handleSubmit} className="mt-4 space-y-3">
        <div>
          <label className="block text-sm font-medium text-slate-700">Property ID</label>
          <input
            name="propertyId"
            value={propertyId}
            onChange={(event) => setPropertyId(event.target.value)}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none"
            placeholder="e.g. 1024"
          />
        </div>
        <input
          type="file"
          name="file"
          accept="image/*"
          className="block w-full rounded border border-dashed border-slate-300 p-3 text-sm"
        />
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
          <span>Accepts JPEG, PNG, WebP, AVIF up to 5MB</span>
          <button
            type="submit"
            className="rounded bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isUploading || !isAuthenticated}
          >
            {isUploading ? 'Uploading…' : 'Upload asset'}
          </button>
        </div>
      </form>
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      {result && (
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase text-slate-500">WebP URL</p>
            <p className="break-all text-sm">{result.webp}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-slate-500">AVIF URL</p>
            <p className="break-all text-sm">{result.avif}</p>
          </div>
          <div className="md:col-span-2">
            <div className="relative h-48 overflow-hidden rounded border border-slate-200">
              <Image
                src={result.webp}
                alt="Uploaded preview"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
export default function AdminImageManager() {
  const { isAuthenticated, isReady, logout } = useAdminAuth()

  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]['id']>('pipeline')
  const [changeSets, setChangeSets] = useState<ChangeSetRecord[]>(initialChangeSets)
  const [confirmState, setConfirmState] = useState<ConfirmState | null>(null)
  const [filter, setFilter] = useState<'all' | WorkflowStatus>('all')

  const [toasts, pushToast, dismissToast] = useToastQueue()

  const [idCounter, setIdCounter] = useState(() => {
    return changeSets.reduce((max, item) => {
      const parsed = Number(item.id.replace(/\D+/g, ''))
      return Number.isFinite(parsed) ? Math.max(max, parsed) : max
    }, 1000)
  })

  const [users, setUsers] = useState<AdminUserDto[]>([])
  const [usersMeta, setUsersMeta] = useState({
    loading: false,
    loaded: false,
    error: null as string | null,
    dbAuthEnabled: false,
    migratable: false,
  })
  const [newUser, setNewUser] = useState({ username: '', password: '', isActive: true })

  const [jobs, setJobs] = useState<SchedulerJobDto[]>([])
  const [jobsMeta, setJobsMeta] = useState({
    loading: false,
    loaded: false,
    error: null as string | null,
  })
  const [jobsRefreshedAt, setJobsRefreshedAt] = useState<string | null>(null)
  const [isBackingUp, setIsBackingUp] = useState(false)

  const loadJobs = useCallback(async () => {
    if (!isAuthenticated) return
    setJobsMeta({ loading: true, loaded: true, error: null })
    try {
      const payload = await apiRequest<{ jobs: SchedulerJobDto[] }>('/v1/scheduler/logs')
      setJobs(payload.jobs)
      setJobsMeta({ loading: false, loaded: true, error: null })
      setJobsRefreshedAt(new Date().toISOString())
    } catch (error: any) {
      const message = error instanceof ApiError ? error.message : error?.message ?? 'Unable to load scheduler logs'
      setJobsMeta({ loading: false, loaded: true, error: message })
      pushToast({ tone: 'error', title: 'Scheduler logs failed', description: message })
    }
  }, [isAuthenticated, pushToast])

  const openConfirm = useCallback((record: ChangeSetRecord, action: WorkflowAction) => {
    setConfirmState({
      changeSet: record,
      action,
      scheduleAt: action.requiresSchedule
        ? toDatetimeLocal(new Date(Date.now() + 60 * 60 * 1000))
        : undefined,
    })
  }, [])

  const updateScheduleValue = useCallback((scheduleAt?: string) => {
    setConfirmState((current) => (current ? { ...current, scheduleAt, error: null } : current))
  }, [])

  const applyWorkflowAction = useCallback(
    (record: ChangeSetRecord, action: WorkflowAction, scheduleAt?: string) => {
      if (action.type === 'duplicate') {
        const nextIdNumber = idCounter + 1
        const newChangeSet: ChangeSetRecord = {
          ...record,
          id: `CS-${nextIdNumber}`,
          status: 'draft',
          scheduledFor: null,
          updatedAt: new Date().toISOString(),
          lastAction: `Duplicated from ${record.id}`,
        }
        setChangeSets((current) => [newChangeSet, ...current])
        setIdCounter(nextIdNumber)
        pushToast({
          tone: 'success',
          title: 'Draft created',
          description: `${record.title} duplicated back to draft as ${newChangeSet.id}.`,
        })
        return
      }

      const isoSchedule = scheduleAt ? new Date(scheduleAt).toISOString() : undefined
      let nextStatus: WorkflowStatus = action.targetStatus ?? record.status
      let nextSchedule: string | null = record.scheduledFor ?? null
      let lastAction = action.label

      switch (action.key) {
        case 'submit':
          nextStatus = 'review'
          nextSchedule = null
          lastAction = 'Sent to review'
          break
        case 'approve':
        case 'reschedule':
          nextStatus = 'scheduled'
          nextSchedule = isoSchedule ?? record.scheduledFor ?? null
          lastAction = action.key === 'approve' ? 'Scheduled for publish' : 'Schedule updated'
          break
        case 'cancel':
          nextStatus = 'review'
          nextSchedule = null
          lastAction = 'Schedule cancelled'
          break
        case 'publish':
          nextStatus = 'published'
          nextSchedule = null
          lastAction = 'Published manually'
          break
        case 'return':
          nextStatus = 'draft'
          nextSchedule = null
          lastAction = 'Returned for edits'
          break
        default:
          nextSchedule = action.requiresSchedule ? isoSchedule ?? record.scheduledFor ?? null : record.scheduledFor ?? null
      }

      const nowIso = new Date().toISOString()

      setChangeSets((current) =>
        current.map((item) =>
          item.id === record.id
            ? {
                ...item,
                status: nextStatus,
                scheduledFor: nextSchedule,
                updatedAt: nowIso,
                lastAction,
              }
            : item,
        ),
      )

      void apiRequest('/v1/schedule', {
        method: 'POST',
        json: {
          changeSetId: record.id,
          action: action.key,
          status: nextStatus,
          scheduleAt: nextSchedule,
        },
      })
        .then(() => {
          loadJobs()
        })
        .catch((error: any) => {
          const message = error instanceof ApiError ? error.message : error?.message ?? 'Unable to sync workflow action'
          pushToast({ tone: 'error', title: 'Workflow sync failed', description: message })
        })

      const actionSummary: Record<string, { title: string; description: string }> = {
        submit: {
          title: 'Draft sent to review',
          description: `${record.title} is now with reviewers.`,
        },
        approve: {
          title: 'Change set scheduled',
          description: `${record.title} will publish at ${formatDate(isoSchedule ?? record.scheduledFor)}.`,
        },
        reschedule: {
          title: 'Schedule updated',
          description: `New go-live time set for ${formatDate(isoSchedule ?? record.scheduledFor)}.`,
        },
        cancel: {
          title: 'Schedule cancelled',
          description: `${record.title} moved back to review.`,
        },
        publish: {
          title: 'Published live',
          description: `${record.title} is now live.`,
        },
        return: {
          title: 'Sent back to draft',
          description: `${record.title} needs more edits.`,
        },
      }

      const summary = actionSummary[action.key]
      if (summary) {
        pushToast({ tone: 'success', ...summary })
      } else {
        pushToast({ tone: 'info', title: `${action.label} applied` })
      }
    },
    [idCounter, loadJobs, pushToast],
  )

  const confirmAction = useCallback(() => {
    if (!confirmState) return
    if (confirmState.action.requiresSchedule && !confirmState.scheduleAt) {
      setConfirmState((current) => (current ? { ...current, error: 'Select a schedule time' } : current))
      return
    }
    applyWorkflowAction(confirmState.changeSet, confirmState.action, confirmState.scheduleAt)
    setConfirmState(null)
  }, [applyWorkflowAction, confirmState])

  const cancelConfirm = useCallback(() => setConfirmState(null), [])

  const stats = useMemo(() => {
    const counts: Record<WorkflowStatus, number> = {
      draft: 0,
      review: 0,
      scheduled: 0,
      published: 0,
    }
    changeSets.forEach((item) => {
      counts[item.status] += 1
    })
    return counts
  }, [changeSets])

  const filteredChangeSets = useMemo(() => {
    if (filter === 'all') return changeSets
    return changeSets.filter((item) => item.status === filter)
  }, [changeSets, filter])
  const loadUsers = useCallback(async () => {
    if (!isAuthenticated) return
    setUsersMeta((current) => ({ ...current, loading: true, error: null }))
    try {
      const data = await apiRequest<UsersApiResponse>('/v1/admin/users')
      setUsers(data.users)
      setUsersMeta({
        loading: false,
        loaded: true,
        error: null,
        dbAuthEnabled: data.dbAuthEnabled,
        migratable: data.migratableEnvAdmin,
      })
    } catch (error: any) {
      const message = error instanceof ApiError ? error.message : error?.message ?? 'Unable to load users'
      setUsersMeta((current) => ({ ...current, loading: false, loaded: true, error: message }))
      pushToast({ tone: 'error', title: 'Failed to load users', description: message })
    }
  }, [isAuthenticated, pushToast])

  const createUser = useCallback(async () => {
    if (!isAuthenticated) return
    if (!newUser.username || newUser.password.length < 8) {
      pushToast({
        tone: 'error',
        title: 'Invalid user details',
        description: 'Provide a username and a password with at least 8 characters.',
      })
      return
    }
    try {
      const payload = await apiRequest<{ user: AdminUserDto }>('/v1/admin/users', {
        method: 'POST',
        json: newUser,
      })
      setUsers((current) => [payload.user, ...current])
      setNewUser({ username: '', password: '', isActive: true })
      pushToast({ tone: 'success', title: 'Admin user created', description: payload.user.username })
    } catch (error: any) {
      const message = error instanceof ApiError ? error.message : error?.message ?? 'Unable to create user'
      pushToast({ tone: 'error', title: 'Create user failed', description: message })
    }
  }, [isAuthenticated, newUser, pushToast])

  const updateUser = useCallback(
    async (id: number, updates: { password?: string; isActive?: boolean }) => {
      if (!isAuthenticated) return
      try {
        const payload = await apiRequest<{ user: AdminUserDto }>(`/v1/admin/users/${id}`, {
          method: 'PATCH',
          json: updates,
        })
        setUsers((current) => current.map((user) => (user.id === id ? payload.user : user)))
        pushToast({
          tone: 'success',
          title: 'User updated',
          description: `Saved changes for ${payload.user.username}`,
        })
      } catch (error: any) {
        const message = error instanceof ApiError ? error.message : error?.message ?? 'Unable to update user'
        pushToast({ tone: 'error', title: 'Update failed', description: message })
      }
    },
    [isAuthenticated, pushToast],
  )

  const migrateEnvAdmin = useCallback(async () => {
    if (!isAuthenticated) return
    try {
      const payload = await apiRequest<{
        user: AdminUserDto
        dbAuthEnabled: boolean
        message?: string
      }>('/v1/admin/users/migrate', {
        method: 'POST',
      })
      setUsers((current) => {
        const existing = current.find((user) => user.id === payload.user.id)
        if (existing) {
          return current.map((user) => (user.id === payload.user.id ? payload.user : user))
        }
        return [payload.user, ...current]
      })
      setUsersMeta((current) => ({
        ...current,
        dbAuthEnabled: payload.dbAuthEnabled,
        migratable: false,
      }))
      pushToast({
        tone: 'success',
        title: 'Admin migrated',
        description: payload.message ?? 'Environment credentials migrated successfully.',
      })
    } catch (error: any) {
      const message = error instanceof ApiError ? error.message : error?.message ?? 'Unable to migrate admin user'
      pushToast({ tone: 'error', title: 'Migration failed', description: message })
    }
  }, [isAuthenticated, pushToast])

  const downloadBackup = useCallback(async () => {
    if (!isAuthenticated) {
      pushToast({
        tone: 'error',
        title: 'Backup unavailable',
        description: 'Sign in again to request a workspace backup.',
      })
      return
    }
    setIsBackingUp(true)
    try {
      const response = await apiFetch('/v1/backup', { method: 'POST' })
      if (!response.ok) {
        const message = await response
          .json()
          .then((payload) => payload.error ?? 'Backup failed')
          .catch(() => 'Backup failed')
        throw new Error(message)
      }
      const blob = await response.blob()
      const filename =
        getFilenameFromDisposition(response.headers.get('Content-Disposition')) ??
        `admin-backup-${new Date().toISOString().replace(/[:.]/g, '-')}.zip`
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      pushToast({ tone: 'success', title: 'Backup ready', description: filename })
    } catch (error: any) {
      const message = error?.message ?? 'Unable to download backup'
      pushToast({ tone: 'error', title: 'Backup failed', description: message })
    } finally {
      setIsBackingUp(false)
    }
  }, [isAuthenticated, pushToast])

  useEffect(() => {
    if (activeTab === 'users' && !usersMeta.loaded && !usersMeta.loading) {
      loadUsers()
    }
  }, [activeTab, loadUsers, usersMeta.loaded, usersMeta.loading])

  useEffect(() => {
    if (activeTab === 'scheduler' && !jobsMeta.loading && !jobsMeta.loaded) {
      loadJobs()
    }
  }, [activeTab, jobsMeta.loaded, jobsMeta.loading, loadJobs])

  if (!isReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="rounded-lg bg-white px-6 py-4 text-sm font-medium text-slate-600 shadow">
          Loading admin workspace…
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <AdminLoginForm title="Admin workspace" description="Sign in to manage content operations." />
  }
  return (
    <div className="space-y-6 p-6">
      <header className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold">Admin workspace</h1>
          <button
            type="button"
            onClick={logout}
            className="rounded border border-slate-300 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600 transition hover:border-slate-400 hover:text-slate-800"
          >
            Sign out
          </button>
        </div>
        <p className="max-w-3xl text-sm text-slate-600">
          Coordinate content releases, manage admin access, review scheduler health, and upload
          production-ready imagery from one streamlined dashboard.
        </p>
        <nav className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                activeTab === tab.id
                  ? 'border-slate-900 bg-slate-900 text-white'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
        <p className="text-xs uppercase tracking-wide text-slate-500">
          {tabs.find((tab) => tab.id === activeTab)?.description}
        </p>
      </header>

      {activeTab === 'pipeline' && (
        <section className="space-y-5">
          <div className="grid gap-4 md:grid-cols-4">
            {(['draft', 'review', 'scheduled', 'published'] as WorkflowStatus[]).map((status) => (
              <div
                key={status}
                className="rounded border border-slate-200 bg-white p-4 shadow-sm"
              >
                <p className="text-xs uppercase text-slate-500">{statusLabels[status]}</p>
                <p className="mt-1 text-2xl font-semibold">{stats[status]}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {status === 'scheduled'
                    ? 'Queued for automatic publish'
                    : status === 'review'
                      ? 'Awaiting reviewer approval'
                      : status === 'draft'
                        ? 'In authoring'
                        : 'Live in production'}
                </p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setFilter('all')}
                className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide transition ${
                  filter === 'all'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All ({changeSets.length})
              </button>
              {(['draft', 'review', 'scheduled', 'published'] as WorkflowStatus[]).map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setFilter(status)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide transition ${
                    filter === status
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {statusLabels[status]} ({stats[status]})
                </button>
              ))}
            </div>
            <span className="text-xs text-slate-500">
              Updated {formatRelative(changeSets[0]?.updatedAt ?? new Date().toISOString())}
            </span>
          </div>

          <div className="overflow-hidden rounded border border-slate-200 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3 text-left">Change set</th>
                  <th className="px-4 py-3 text-left">Owner</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Scheduled</th>
                  <th className="px-4 py-3 text-left">Updated</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredChangeSets.map((changeSet) => (
                  <tr key={changeSet.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 align-top">
                      <div className="font-semibold text-slate-900">{changeSet.title}</div>
                      <div className="text-xs text-slate-500">{changeSet.id}</div>
                      {changeSet.lastAction && (
                        <div className="mt-1 text-xs text-slate-500">{changeSet.lastAction}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 align-top text-slate-600">{changeSet.owner}</td>
                    <td className="px-4 py-3 align-top">
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[changeSet.status]}`}
                      >
                        {statusLabels[changeSet.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 align-top text-slate-600">
                      {changeSet.status === 'scheduled'
                        ? formatDate(changeSet.scheduledFor)
                        : '—'}
                    </td>
                    <td className="px-4 py-3 align-top text-slate-600">
                      {formatRelative(changeSet.updatedAt)}
                    </td>
                    <td className="px-4 py-3 align-top">
                      <div className="flex flex-wrap gap-2">
                        {workflowActions[changeSet.status].map((action) => (
                          <button
                            key={action.key}
                            type="button"
                            onClick={() => openConfirm(changeSet, action)}
                            className={`rounded px-3 py-1 text-xs font-semibold transition ${
                              action.variant === 'danger'
                                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                : action.variant === 'primary'
                                  ? 'bg-slate-900 text-white hover:bg-slate-700'
                                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                          >
                            {action.label}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <AssetUploadPanel showToast={pushToast} />
        </section>
      )}

      {activeTab === 'users' && (
        <section className="space-y-6">
          <div className="rounded border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Add admin user</h2>
            <p className="mt-1 text-sm text-slate-600">
              Create dedicated credentials stored in the database. Passwords must be at least 8
              characters.
            </p>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <label className="text-sm font-medium text-slate-600">
                Username
                <input
                  value={newUser.username}
                  onChange={(event) =>
                    setNewUser((current) => ({ ...current, username: event.target.value }))
                  }
                  className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
                  placeholder="workspace admin"
                />
              </label>
              <label className="text-sm font-medium text-slate-600">
                Password
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(event) =>
                    setNewUser((current) => ({ ...current, password: event.target.value }))
                  }
                  className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
                  placeholder="••••••••"
                />
              </label>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-600">
                <input
                  type="checkbox"
                  checked={newUser.isActive}
                  onChange={(event) =>
                    setNewUser((current) => ({ ...current, isActive: event.target.checked }))
                  }
                  className="h-4 w-4 rounded border-slate-300"
                />
                Active immediately
              </label>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={createUser}
                className="rounded bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
              >
                Save admin user
              </button>
              <div className="text-xs text-slate-500">
                {usersMeta.dbAuthEnabled
                  ? 'Database-backed login is enabled.'
                  : 'Enable ADMIN_DB_AUTH_ENABLED to require database logins.'}
              </div>
            </div>
          </div>

          <div className="rounded border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">Existing admins</h2>
                <p className="mt-1 text-sm text-slate-600">
                  Toggle access or reset passwords directly from the workspace.
                </p>
              </div>
              <button
                type="button"
                onClick={loadUsers}
                className="rounded border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Refresh list
              </button>
            </div>
            {usersMeta.migratable && (
              <div className="mt-4 rounded border border-dashed border-amber-400 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span>
                    An environment-based admin is available. Migrate it to the database to manage here.
                  </span>
                  <button
                    type="button"
                    onClick={migrateEnvAdmin}
                    className="rounded bg-amber-500 px-3 py-1 text-xs font-semibold uppercase text-white shadow hover:bg-amber-400"
                  >
                    Migrate ENV admin
                  </button>
                </div>
              </div>
            )}
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3 text-left">Username</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Created</th>
                    <th className="px-4 py-3 text-left">Updated</th>
                    <th className="px-4 py-3 text-left">Controls</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="px-4 py-3 font-semibold text-slate-800">{user.username}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                            user.isActive
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {user.isActive ? 'Active' : 'Suspended'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{formatDate(user.createdAt)}</td>
                      <td className="px-4 py-3 text-slate-600">{formatDate(user.updatedAt)}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              updateUser(user.id, { isActive: !user.isActive })
                            }
                            className="rounded border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                          >
                            {user.isActive ? 'Disable' : 'Re-activate'}
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              updateUser(user.id, {
                                password: window.prompt(
                                  `Set a new password for ${user.username} (min 8 characters):`,
                                ) || undefined,
                              })
                            }
                            className="rounded border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                          >
                            Reset password
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {activeTab === 'scheduler' && (
        <section className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">Scheduler job history</h2>
              <p className="text-sm text-slate-600">
                Monitor the automation queue, inspect job attempts, and audit logs captured by the
                publishing scheduler.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              {jobsRefreshedAt && <span>Updated {formatRelative(jobsRefreshedAt)}</span>}
              <button
                type="button"
                onClick={loadJobs}
                className="rounded border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Refresh jobs
              </button>
            </div>
          </div>

          {jobsMeta.loading && <p className="text-sm text-slate-600">Loading job history…</p>}
          {jobsMeta.error && (
            <p className="text-sm text-red-600">Unable to load jobs: {jobsMeta.error}</p>
          )}

          <div className="space-y-4">
            {jobs.map((job) => (
              <div key={job.id} className="rounded border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-semibold">Publish job #{job.id}</h3>
                    {job.changeSet && (
                      <p className="text-xs text-slate-500">
                        Change set #{job.changeSet.id}{' '}
                        {job.changeSet.description ? `– ${job.changeSet.description}` : ''}
                      </p>
                    )}
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${
                      job.status === 'COMPLETED'
                        ? 'bg-emerald-100 text-emerald-700'
                        : job.status === 'FAILED'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {job.status}
                  </span>
                </div>
                <div className="mt-3 grid gap-3 text-xs text-slate-600 md:grid-cols-4">
                  <div>
                    <p className="font-semibold text-slate-500">Queued</p>
                    <p>{formatDate(job.queuedAt)}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-500">Started</p>
                    <p>{job.startedAt ? formatDate(job.startedAt) : '—'}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-500">Completed</p>
                    <p>{job.completedAt ? formatDate(job.completedAt) : '—'}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-500">Attempts</p>
                    <p>{job.attempts}</p>
                  </div>
                </div>
                {job.logs.length > 0 && (
                  <div className="mt-4 space-y-2 text-xs">
                    {job.logs.map((log) => (
                      <div
                        key={log.id}
                        className="rounded border border-slate-200 bg-slate-50 px-3 py-2"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="font-semibold text-slate-700">
                            {log.action} · {log.actor}
                          </span>
                          <span className="text-[0.65rem] uppercase tracking-wide text-slate-500">
                            {formatDate(log.createdAt)}
                          </span>
                        </div>
                        <p className="mt-1 text-slate-600">
                          Result: {log.result ?? 'n/a'}{' '}
                          {log.reason ? `– ${log.reason}` : ''}
                        </p>
                        {log.details && (
                          <pre className="mt-2 overflow-x-auto rounded bg-black/80 p-2 text-[0.65rem] text-emerald-200">
                            {typeof log.details === 'string'
                              ? log.details
                              : JSON.stringify(log.details, null, 2)}
                          </pre>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {jobs.length === 0 && !jobsMeta.loading && !jobsMeta.error && (
              <p className="text-sm text-slate-600">No scheduler jobs recorded yet.</p>
            )}
          </div>
        </section>
      )}

      {activeTab === 'uploads' && (
        <section>
          <AssetUploadPanel showToast={pushToast} />
        </section>
      )}

      {activeTab === 'settings' && (
        <section className="space-y-6">
          <div className="rounded border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold">Workspace backups</h2>
            <p className="mt-2 text-sm text-slate-600">
              Generate a ZIP archive that includes the Prisma development database, every JSON
              dataset under <code>public/data</code>, and the 20 most recent processed uploads.
            </p>
            <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-slate-600">
              <li>An authenticated admin session with a valid access token is required.</li>
              <li>
                Ensure the server can read <code>prisma/dev.db</code>, <code>public/data</code>, and{' '}
                <code>public/uploads/processed</code>.
              </li>
            </ul>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={downloadBackup}
                disabled={isBackingUp || !isAuthenticated}
                className="rounded bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isBackingUp ? 'Preparing backup…' : 'Backup now'}
              </button>
              {!isAuthenticated && (
                <span className="text-xs text-red-600">
                  Sign in to generate workspace backups.
                </span>
              )}
            </div>
          </div>
        </section>
      )}

      <ConfirmDialog
        state={confirmState}
        onCancel={cancelConfirm}
        onConfirm={confirmAction}
        onScheduleChange={updateScheduleValue}
      />
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  )
}
