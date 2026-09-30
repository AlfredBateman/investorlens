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
import { deleteInterview } from "@/server/actions/interview";
import { useDeleteAction } from "@/hooks/use-delete-action";
import { Trash2 } from "lucide-react";

type Props = {
  interviewId: string;
  candidateName: string;
  projectId: string;
};

export function DeleteInterviewButton({ interviewId, candidateName, projectId }: Props) {
  const { open, setOpen, isPending, handleDelete } = useDeleteAction(
    () => deleteInterview(interviewId, projectId),
    "Failed to delete interview."
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        id="delete-interview-trigger"
        aria-label={`Delete interview with "${candidateName}"`}
        render={
          <Button variant="destructive" size="sm">
            <Trash2 className="size-4" />
            Delete
          </Button>
        }
      />

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Delete Interview?</DialogTitle>
          <DialogDescription>
            This will permanently delete the interview with{" "}
            <span className="font-medium text-foreground">{candidateName}</span> and unlink it
            from any findings or personas that reference it. This action cannot be undone.
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
            id="confirm-delete-interview"
          >
            {isPending ? "Deleting…" : "Yes, delete interview"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
