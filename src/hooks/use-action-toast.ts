"use client";

import { useEffect } from "react";
import { toast } from "@/components/ui/toast";
import type { ActionResult } from "@/server/actions/types";

/**
 * Toasts a `useActionState` result's general message once per action call.
 * Field-level errors (`state.error`) are shown inline by the form itself, so
 * they're skipped here to avoid saying the same thing twice.
 */
export function useActionToast(state: ActionResult | null | undefined) {
  useEffect(() => {
    if (!state?.message || state.error) return;
    (state.success ? toast.success : toast.error)(state.message);
  }, [state]);
}
