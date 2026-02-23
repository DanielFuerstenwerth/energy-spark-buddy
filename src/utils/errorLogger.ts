import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import { telemetry } from "./telemetry";

interface ErrorLogPayload {
  error_message: string;
  error_stack?: string;
  component?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Logs an error to the error_logs table for admin review.
 * Fire-and-forget — never throws.
 *
 * @deprecated Prefer `telemetry.error()` / `telemetry.warn()` for new code.
 *             This function is kept for backward compatibility.
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
    // Silently fail
  }
}

/**
 * Installs global handlers for uncaught errors and unhandled promise rejections.
 * Enhanced for Safari/iOS "Script error." — extracts max available info.
 * Call once in main.tsx.
 */
export function installGlobalErrorHandlers(): void {
  window.addEventListener("error", (event) => {
    const isSafariScriptError =
      event.message === "Script error." && !event.filename && !event.lineno;

    telemetry.error("uncaught_error", {
      component: "global/error",
      message: event.message || "Unknown error",
      error_name: event.error?.name,
      error_message: event.error?.message || event.message,
      stack: event.error?.stack,
      filename: event.filename || undefined,
      lineno: event.lineno || undefined,
      colno: event.colno || undefined,
      extra: {
        is_safari_script_error: isSafariScriptError,
        error_type: event.error?.constructor?.name,
      },
    });
  });

  window.addEventListener("unhandledrejection", (event) => {
    const reason = event.reason;
    const isError = reason instanceof Error;

    telemetry.error("unhandled_rejection", {
      component: "global/unhandledrejection",
      message: isError ? reason.message : String(reason ?? "Unknown rejection"),
      error_name: isError ? reason.name : undefined,
      error_message: isError ? reason.message : String(reason),
      stack: isError ? reason.stack : undefined,
      extra: {
        reason_type: typeof reason,
        reason_constructor: reason?.constructor?.name,
      },
    });
  });
}
