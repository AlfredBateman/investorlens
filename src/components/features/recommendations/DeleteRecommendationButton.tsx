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
import { deleteRecommendation } from "@/server/actions/recommendation";
import { useDeleteAction } from "@/hooks/use-delete-action";
import { Trash2 } from "lucide-react";

type Props = {
  recommendationId: string;
  recommendationTitle: string;
  projectId: string;
};

export function DeleteRecommendationButton({
  recommendationId,
  recommendationTitle,
  projectId,
}: Props) {
  const { open, setOpen, isPending, handleDelete } = useDeleteAction(
    () => deleteRecommendation(recommendationId, projectId),
    "Failed to delete recommendation."
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        id="delete-recommendation-trigger"
        aria-label={`Delete recommendation "${recommendationTitle}"`}
        render={
          <Button variant="destructive" size="sm">
            <Trash2 className="size-4" />
            Delete
          </Button>
        }
      />

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Delete Recommendation?</DialogTitle>
          <DialogDescription>
            This will permanently delete the recommendation{" "}
            <span className="font-medium text-foreground">{recommendationTitle}</span>. This
            action cannot be undone.
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
            id="confirm-delete-recommendation"
          >
            {isPending ? "Deleting…" : "Yes, delete recommendation"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
