/**
 * Plausible Analytics helper — SSR-safe, deduped "View" events.
 *
 * Usage:
 *   track("Survey Start")
 *   track("Survey Step View", { step: "2" })
 *
 * Deduping: Events whose name ends with "View" are sent at most once per
 * unique (name + JSON.stringify(props)) combination within a page session.
 * Navigation events (Next/Back/Complete/Start/Error) are always sent.
 */

declare global {
  interface Window {
    plausible?: (event: string, options?: { props?: Record<string, string | number> }) => void;
  }
}

const sentViews = new Set<string>();

/**
 * Send a custom event to Plausible.
 * @param name  Event name (e.g. "Survey Step View")
 * @param props Optional key-value properties (no PII!)
 */
export function track(name: string, props?: Record<string, string | number>): void {
  if (typeof window === "undefined") return;
  if (typeof window.plausible !== "function") return;

  // Dedupe "View" events: only send once per unique name+props combo
  if (name.includes("View")) {
    const key = name + (props ? JSON.stringify(props) : "");
    if (sentViews.has(key)) return;
    sentViews.add(key);
  }

  if (props) {
    window.plausible(name, { props });
  } else {
    window.plausible(name);
  }
}

/**
 * Reset the deduplication cache (e.g. on full survey restart).
 */
export function resetTrackingDedup(): void {
  sentViews.clear();
}
