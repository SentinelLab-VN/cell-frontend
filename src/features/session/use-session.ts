import { useSyncExternalStore } from "react";
import { sessionStore, type Session } from "./session-store";

export function useSession(): Session | null {
  return useSyncExternalStore(sessionStore.subscribe, sessionStore.get);
}

/** For screens behind the session guard, where there is always one. */
export function useRequiredSession(): Session {
  const session = useSession();
  if (!session) throw new Error("This screen needs a session.");
  return session;
}
