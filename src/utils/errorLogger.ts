import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";

interface ErrorLogPayload {
  error_message: string;
  error_stack?: string;
  component?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Logs an error to the error_logs table for admin review.
 * Fire-and-forget — never throws.
 */
export async function logErrorToDb(payload: ErrorLogPayload): Promise<void> {
  try {
    await supabase.from("error_logs").insert([{
      error_message: payload.error_message.slice(0, 2000),
      error_stack: payload.error_stack?.slice(0, 5000) ?? null,
      user_agent: navigator.userAgent,
      url: window.location.href,
      component: payload.component ?? null,
      metadata: (payload.metadata as Json) ?? null,
    }]);
  } catch {
    // Silently fail — we don't want error logging to cause more errors
  }
}

/**
 * Installs global handlers for uncaught errors and unhandled promise rejections.
 * Call once in main.tsx or App.tsx.
 */
export function installGlobalErrorHandlers(): void {
  window.addEventListener("error", (event) => {
    logErrorToDb({
      error_message: event.message || "Unknown error",
      error_stack: event.error?.stack,
      component: "global/error",
      metadata: {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      },
    });
  });

  window.addEventListener("unhandledrejection", (event) => {
    const reason = event.reason;
    const message =
      reason instanceof Error ? reason.message : String(reason ?? "Unknown rejection");
    const stack = reason instanceof Error ? reason.stack : undefined;

    logErrorToDb({
      error_message: message,
      error_stack: stack,
      component: "global/unhandledrejection",
    });
  });
}
