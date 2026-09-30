/**
 * src/server/actions/types.ts
 *
 * Shared types used across all server action modules.
 * Centralised here to avoid duplicating the ActionResult type in every file.
 */

/**
 * Standard result type returned by form-based server actions.
 * Compatible with React 19's `useActionState` hook.
 *
 * - `error`   — per-field validation errors (from Zod `.flatten()`)
 * - `message` — general feedback message (success or server-side failure)
 * - `success` — whether the mutation succeeded (for styling differentiation)
 */
export type ActionResult = {
  error?: Record<string, string[] | undefined>;
  message?: string;
  success?: boolean;
};
