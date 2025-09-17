import { API_BASE_URL } from './config'

export class ApiError<T = unknown> extends Error {
  public readonly status: number
  public readonly data: T | null

  constructor(message: string, status: number, data: T | null) {
    super(message)
    this.status = status
    this.data = data
  }
}

type UnauthorizedHandler = () => void

let authToken: string | null = null
let unauthorizedHandler: UnauthorizedHandler | null = null

export function setAuthToken(token: string | null): void {
  authToken = token
}

export function getAuthToken(): string | null {
  return authToken
}

export function setUnauthorizedHandler(handler: UnauthorizedHandler | null): void {
  unauthorizedHandler = handler
}

export interface ApiFetchOptions extends RequestInit {
  auth?: boolean
}

function resolveUrl(path: string): string {
  if (/^https?:/i.test(path)) {
    return path
  }
  const base = API_BASE_URL
  if (!base) {
    return path
  }
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${base}${normalizedPath}`
}

export async function apiFetch(path: string, options: ApiFetchOptions = {}): Promise<Response> {
  const { auth = true, headers, ...rest } = options
  const requestHeaders =
    headers instanceof Headers ? headers : new Headers(headers ? (headers as HeadersInit) : undefined)
  if (auth && authToken && !requestHeaders.has('Authorization')) {
    requestHeaders.set('Authorization', `Bearer ${authToken}`)
  }

  const response = await fetch(resolveUrl(path), {
    ...rest,
    headers: requestHeaders,
    credentials: 'omit',
  })

  if (response.status === 401 && auth && unauthorizedHandler) {
    unauthorizedHandler()
  }

  return response
}

export interface ApiRequestOptions<TBody = unknown> extends ApiFetchOptions {
  json?: TBody
}

function resolveBody(options: ApiRequestOptions): {
  body: BodyInit | null | undefined
  headers: Headers
} {
  const headers =
    options.headers instanceof Headers
      ? options.headers
      : new Headers(options.headers ? (options.headers as HeadersInit) : undefined)

  if (options.json !== undefined) {
    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json')
    }
    return { body: JSON.stringify(options.json), headers }
  }

  return { body: options.body, headers }
}

function extractErrorMessage(data: unknown, status: number): string {
  if (typeof data === 'string' && data.trim().length > 0) {
    return data
  }
  if (data && typeof data === 'object') {
    const maybeError = (data as Record<string, unknown>).error
    if (typeof maybeError === 'string' && maybeError.length > 0) {
      return maybeError
    }
    const maybeMessage = (data as Record<string, unknown>).message
    if (typeof maybeMessage === 'string' && maybeMessage.length > 0) {
      return maybeMessage
    }
  }
  return `Request failed with status ${status}`
}

export async function apiRequest<TResponse = unknown, TBody = unknown>(
  path: string,
  options: ApiRequestOptions<TBody> = {},
): Promise<TResponse> {
  const { body, headers } = resolveBody(options)
  const response = await apiFetch(path, { ...options, headers, body })

  const contentType = response.headers.get('content-type') || ''
  let payload: unknown = null

  if (contentType.includes('application/json')) {
    try {
      payload = await response.json()
    } catch {
      payload = null
    }
  } else {
    try {
      const text = await response.text()
      payload = text.length > 0 ? text : null
    } catch {
      payload = null
    }
  }

  if (!response.ok) {
    throw new ApiError(extractErrorMessage(payload, response.status), response.status, payload)
  }

  return payload as TResponse
}
