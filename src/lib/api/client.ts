import { sessionStore } from "@/features/session/session-store";

/** An error the API answered with. `code` is stable; `message` is for people. */
export class ApiError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

/** Lists answer `{ items, nextCursor }`. */
export interface Page<T> {
  items: T[];
  nextCursor: string | null;
}

type Query = Record<string, string | number | undefined>;

interface RequestOptions {
  body?: unknown;
  query?: Query;
  idempotencyKey?: string;
}

interface Answer<T> {
  status: number;
  data: T;
}

async function send<T>(method: string, path: string, options: RequestOptions = {}): Promise<Answer<T>> {
  const token = sessionStore.get()?.token;
  const headers: Record<string, string> = {};
  if (token) headers.authorization = `Bearer ${token}`;
  if (options.body !== undefined) headers["content-type"] = "application/json";
  if (options.idempotencyKey) headers["idempotency-key"] = options.idempotencyKey;

  const response = await fetch(withQuery(path, options.query), {
    method,
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });

  // The session expired or was revoked: drop it, and the router sends the user to connect.
  if (response.status === 401 && token) sessionStore.clear();

  const payload = await readJson(response);
  if (!response.ok) {
    const error = (payload as { error?: { code?: string; message?: string } } | null)?.error;
    throw new ApiError(response.status, error?.code ?? "unknown", error?.message ?? response.statusText);
  }
  return { status: response.status, data: payload as T };
}

function withQuery(path: string, query?: Query): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined) params.set(key, String(value));
  }
  const text = params.toString();
  return text ? `${path}?${text}` : path;
}

async function readJson(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export const http = {
  get: async <T>(path: string, query?: Query) => (await send<T>("GET", path, { query })).data,
  post: async <T>(path: string, body: unknown = {}, idempotencyKey?: string) =>
    (await send<T>("POST", path, { body, idempotencyKey })).data,
  patch: async <T>(path: string, body: unknown = {}) => (await send<T>("PATCH", path, { body })).data,
  /** For the few routes where 200 and 202 mean different things. */
  postWithStatus: <T>(path: string, body: unknown = {}) => send<T>("POST", path, { body }),
};
