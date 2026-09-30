"use client";

/**
 * src/components/features/projects/DeleteProjectButton.tsx
 *
 * Delete button with confirmation dialog using @base-ui/react/dialog.
 *
 * Important: Base UI Dialog's Trigger uses `render` prop for polymorphism,
 * not `asChild`. Wrap the button using DialogTrigger with render={<Button />}.
 */

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { deleteProject } from "@/server/actions/project";
import { useDeleteAction } from "@/hooks/use-delete-action";
import { Trash2 } from "lucide-react";

type Props = {
  projectId: string;
  projectName: string;
};

export function DeleteProjectButton({ projectId, projectName }: Props) {
  const { open, setOpen, isPending, handleDelete } = useDeleteAction(
    () => deleteProject(projectId),
    "Failed to delete project."
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* DialogTrigger from base-ui wraps the button directly */}
      <DialogTrigger
        id="delete-project-trigger"
        aria-label={`Delete project "${projectName}"`}
        render={
          <Button variant="destructive" size="sm">
            <Trash2 />
            Delete
          </Button>
        }
      />

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Delete Project?</DialogTitle>
          <DialogDescription>
            This will permanently delete{" "}
            <span className="font-medium text-foreground">{projectName}</span> and all
            associated interviews, findings, personas, and recommendations. This action
            cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isPending}
            id="confirm-delete-project"
          >
            {isPending ? "Deleting…" : "Yes, delete project"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
