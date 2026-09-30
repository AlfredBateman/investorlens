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
import { deleteJourneyMap } from "@/server/actions/journeyMap";
import { useDeleteAction } from "@/hooks/use-delete-action";
import { Trash2 } from "lucide-react";

type Props = {
  journeyMapId: string;
  journeyMapTitle: string;
  projectId: string;
};

export function DeleteJourneyMapButton({ journeyMapId, journeyMapTitle, projectId }: Props) {
  const { open, setOpen, isPending, handleDelete } = useDeleteAction(
    () => deleteJourneyMap(journeyMapId, projectId),
    "Failed to delete journey map."
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        id="delete-journey-map-trigger"
        aria-label={`Delete journey map "${journeyMapTitle}"`}
        render={
          <Button variant="destructive" size="sm">
            <Trash2 className="size-4" />
            Delete
          </Button>
        }
      />

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Delete Journey Map?</DialogTitle>
          <DialogDescription>
            This will permanently delete{" "}
            <span className="font-medium text-foreground">{journeyMapTitle}</span> and all of
            its stages. This action cannot be undone.
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
            id="confirm-delete-journey-map"
          >
            {isPending ? "Deleting…" : "Yes, delete journey map"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
