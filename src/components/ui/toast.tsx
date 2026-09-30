"use client"

import { Toast as ToastPrimitive } from "@base-ui/react/toast"
import { cn } from "@/lib/utils"
import { CheckCircle2, XCircle, X } from "lucide-react"

const toastManager = ToastPrimitive.createToastManager()

/** Imperative toast API, usable from any client component: toast.success("Saved."). */
export const toast = {
  success: (title: string) => toastManager.add({ title, type: "success" }),
  error: (title: string) => toastManager.add({ title, type: "error" }),
}

function ToastList() {
  const { toasts } = ToastPrimitive.useToastManager()
  return toasts.map((t) => (
    <ToastPrimitive.Root
      key={t.id}
      toast={t}
      className={cn(
        "absolute right-0 bottom-0 left-auto z-[calc(1000-var(--toast-index))] mr-0 w-full rounded-xl bg-popover p-3 text-sm text-popover-foreground shadow-lg ring-1 ring-foreground/10",
        "flex items-start gap-2.5 transition-all duration-300",
        "data-[starting-style]:translate-y-full data-[starting-style]:opacity-0",
        "data-[ending-style]:opacity-0",
        "data-[type=success]:ring-emerald-500/20",
        "data-[type=error]:ring-destructive/20"
      )}
      style={{
        transform: "translateY(calc(var(--toast-offset-y) * -1)) scale(var(--toast-scale))",
      }}
    >
      {t.type === "success" ? (
        <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-500" aria-hidden />
      ) : t.type === "error" ? (
        <XCircle className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden />
      ) : null}
      <ToastPrimitive.Content className="min-w-0 flex-1">
        <ToastPrimitive.Title className="font-medium" />
      </ToastPrimitive.Content>
      <ToastPrimitive.Close className="shrink-0 rounded-md p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground">
        <X className="size-3.5" />
      </ToastPrimitive.Close>
    </ToastPrimitive.Root>
  ))
}

/** Mounted once in the root layout; renders every toast added via `toast.success`/`toast.error`. */
export function Toaster() {
  return (
    <ToastPrimitive.Provider toastManager={toastManager}>
      <ToastPrimitive.Portal>
        <ToastPrimitive.Viewport className="fixed right-4 bottom-4 z-50 w-full max-w-sm outline-none">
          <ToastList />
        </ToastPrimitive.Viewport>
      </ToastPrimitive.Portal>
    </ToastPrimitive.Provider>
  )
}
