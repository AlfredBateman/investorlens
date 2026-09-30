import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { FolderX } from "lucide-react";

export default function ProjectNotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-muted">
        <FolderX className="size-7 text-muted-foreground" aria-hidden />
      </div>
      <h1 className="font-heading text-display-sm text-ink">Project not found</h1>
      <p className="mt-1 mb-6 text-sm text-muted-foreground">
        This project may have been deleted or the link is invalid.
      </p>
      <Link href="/projects" className={buttonVariants({ variant: "default" })}>
        Back to Projects
      </Link>
    </div>
  );
}
