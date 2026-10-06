const KEY = "cell.ref";
const CODE = /^[A-Za-z0-9_-]{3,32}$/;

/** Remember the campaign code from a `?ref=` link. The first code seen wins. */
export function captureReferral(search: string = window.location.search) {
  const code = new URLSearchParams(search).get("ref");
  if (!code || !CODE.test(code)) return;
  try {
    if (!localStorage.getItem(KEY)) localStorage.setItem(KEY, code);
  } catch {
    // Storage blocked: the referral is simply not tracked.
  }
}

export function pendingReferral(): string | null {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function clearReferral() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // nothing to clear
  }
}
