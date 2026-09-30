"use client";

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
import { deleteFinding } from "@/server/actions/finding";
import { useDeleteAction } from "@/hooks/use-delete-action";
import { Trash2 } from "lucide-react";

type Props = {
  findingId: string;
  findingTitle: string;
  projectId: string;
};

export function DeleteFindingButton({ findingId, findingTitle, projectId }: Props) {
  const { open, setOpen, isPending, handleDelete } = useDeleteAction(
    () => deleteFinding(findingId, projectId),
    "Failed to delete finding."
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        id="delete-finding-trigger"
        aria-label={`Delete finding "${findingTitle}"`}
        render={
          <Button variant="destructive" size="sm">
            <Trash2 className="size-4" />
            Delete
          </Button>
        }
      />

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Delete Finding?</DialogTitle>
          <DialogDescription>
            This will permanently delete the finding{" "}
            <span className="font-medium text-foreground">{findingTitle}</span> and all of its
            associated recommendations. This action cannot be undone.
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
            id="confirm-delete-finding"
          >
            {isPending ? "Deleting…" : "Yes, delete finding"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
