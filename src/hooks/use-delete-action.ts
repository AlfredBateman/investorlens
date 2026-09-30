"use client";

import { useState, useTransition } from "react";
import { unstable_rethrow } from "next/navigation";
import { toast } from "@/components/ui/toast";
import type { ActionResult } from "@/server/actions/types";

/**
 * Drives a delete-confirmation dialog: tracks open/pending state and runs the
 * delete action. Delete actions redirect on success (a thrown control-flow
 * error that `unstable_rethrow` passes through so navigation happens) and
 * *return* `{ message }` on failure, because production builds strip the
 * message from anything a server action throws. A failure closes the dialog
 * and shows the message as a toast.
 */
export function useDeleteAction(action: () => Promise<ActionResult>, errorFallback: string) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      let result: ActionResult;
      try {
        result = await action();
      } catch (err) {
        unstable_rethrow(err);
        result = { message: errorFallback };
      }
      setOpen(false);
      toast.error(result.message ?? errorFallback);
    });
  }

  return { open, setOpen, isPending, handleDelete };
}
