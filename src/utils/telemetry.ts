/**
 * Structured telemetry for E2E debugging.
 *
 * Log levels:
 *   debug/info → app_telemetry table
 *   warn/error → error_logs table (existing)
 *
 * All events share a consistent field schema.
 * Fire-and-forget — never throws.
 */

import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";

// ── Types ────────────────────────────────────────────────────────────

export type TelemetryLevel = "debug" | "info" | "warn" | "error";

export interface TelemetryEvent {
  level: TelemetryLevel;
  event_type: string;
  component?: string;
  message?: string;

  // Submission context
  client_submission_id?: string;
  survey_id?: string;
  step_id?: string;
  row_count?: number;
  payload_bytes?: number;

  // Request context
  trace_id?: string;
  http_method?: string;
  endpoint?: string;
  status_code?: number;
  latency_ms?: number;
  retry_count?: number;

  // Error context
  error_name?: string;
  error_message?: string;
  stack?: string;
  filename?: string;
  lineno?: number;
  colno?: number;

  // Extra (non-PII!)
  extra?: Record<string, unknown>;
}

// ── Session ID (stable per page load) ────────────────────────────────

let _sessionId: string | null = null;
function getSessionId(): string {
  if (!_sessionId) {
    _sessionId = crypto.randomUUID();
  }
  return _sessionId;
}

// ── App version from build ──────────────────────────────────────────

const APP_VERSION = import.meta.env.VITE_APP_VERSION || "dev";

// ── Core emit function ──────────────────────────────────────────────

export async function emit(event: TelemetryEvent): Promise<void> {
  try {
    const metadata: Record<string, unknown> = {};

    // Submission context
    if (event.client_submission_id) metadata.client_submission_id = event.client_submission_id;
    if (event.survey_id) metadata.survey_id = event.survey_id;
    if (event.step_id) metadata.step_id = event.step_id;
    if (event.row_count !== undefined) metadata.row_count = event.row_count;
    if (event.payload_bytes !== undefined) metadata.payload_bytes = event.payload_bytes;

    // Request context
    if (event.http_method) metadata.http_method = event.http_method;
    if (event.endpoint) metadata.endpoint = event.endpoint;
    if (event.status_code !== undefined) metadata.status_code = event.status_code;
    if (event.latency_ms !== undefined) metadata.latency_ms = event.latency_ms;
    if (event.retry_count !== undefined) metadata.retry_count = event.retry_count;

    // Error context (only for warn/error)
    if (event.error_name) metadata.error_name = event.error_name;
    if (event.error_message) metadata.error_message = event.error_message;
    if (event.filename) metadata.filename = event.filename;
    if (event.lineno !== undefined) metadata.lineno = event.lineno;
    if (event.colno !== undefined) metadata.colno = event.colno;

    // Extra
    if (event.extra) Object.assign(metadata, event.extra);

    const level = event.level;

    if (level === "warn" || level === "error") {
      // Route to error_logs (existing table)
      await supabase.from("error_logs").insert([{
        error_message: (event.message || event.error_message || event.event_type).slice(0, 2000),
        error_stack: event.stack?.slice(0, 5000) ?? null,
        user_agent: navigator.userAgent,
        url: window.location.href,
        component: event.component ?? null,
        metadata: metadata as Json,
      }]);
    } else {
      // Route to app_telemetry (debug/info)
      await supabase.from("app_telemetry").insert([{
        level,
        event_type: event.event_type,
        component: event.component ?? null,
        message: (event.message || "").slice(0, 2000),
        metadata: metadata as Json,
        session_id: getSessionId(),
        trace_id: event.trace_id ?? null,
        user_agent: navigator.userAgent,
        url: window.location.href,
      }]);
    }
  } catch {
    // Silently fail — telemetry must never break the app
  }
}

// ── Convenience helpers ─────────────────────────────────────────────

export const telemetry = {
  debug: (event_type: string, opts?: Partial<TelemetryEvent>) =>
    emit({ level: "debug", event_type, ...opts }),

  info: (event_type: string, opts?: Partial<TelemetryEvent>) =>
    emit({ level: "info", event_type, ...opts }),

  warn: (event_type: string, opts?: Partial<TelemetryEvent>) =>
    emit({ level: "warn", event_type, ...opts }),

  error: (event_type: string, opts?: Partial<TelemetryEvent>) =>
    emit({ level: "error", event_type, ...opts }),

  /** Generate a new trace ID for a submission flow */
  newTraceId: () => crypto.randomUUID(),

  /** Generate a client submission ID (idempotency key) */
  newSubmissionId: () => crypto.randomUUID(),

  /** Get the page session ID */
  sessionId: getSessionId,

  /** App version string */
  appVersion: APP_VERSION,
};
