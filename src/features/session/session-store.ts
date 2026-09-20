// The signed-in session, kept outside React so the API client can read the
// token without a hook. Lives in sessionStorage: closing the tab signs out.

export interface Session {
  token: string;
  address: string;
  providerId: string;
}

const KEY = "cell.session";
const listeners = new Set<() => void>();

function read(): Session | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

let current: Session | null = read();

function emit() {
  for (const listener of listeners) listener();
}

export const sessionStore = {
  get: () => current,
  set(session: Session) {
    current = session;
    sessionStorage.setItem(KEY, JSON.stringify(session));
    emit();
  },
  clear() {
    current = null;
    sessionStorage.removeItem(KEY);
    emit();
  },
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};
