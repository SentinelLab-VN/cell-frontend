import { useSyncExternalStore } from "react";

/**
 * True when the viewport matches `query`. Used to mount ONE of two layouts
 * (table vs. list) instead of rendering both and hiding one with CSS, so the
 * DOM never carries duplicate text or controls for assistive tech and tests.
 */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", onChange);
      return () => list.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

/** Tailwind's `md` breakpoint, the point where the sidebar shell replaces the mobile tab bar. */
export const useIsDesktop = () => useMediaQuery("(min-width: 768px)");
