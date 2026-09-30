import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function FindingNotFound() {
  return (
    <div className="flex h-[50vh] flex-col items-center justify-center text-center">
      <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <AlertCircle className="size-7" aria-hidden />
      </div>
      <h1 className="font-heading text-display-sm text-ink">Finding not found</h1>
      <p className="mt-1 mb-6 text-sm text-muted-foreground max-w-sm">
        The finding you are looking for does not exist or has been deleted.
      </p>
      <Link href="/findings" className={buttonVariants({ variant: "default" })}>
        Go to Findings
      </Link>
    </div>
  );
}
