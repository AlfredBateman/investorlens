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
import { deletePersona } from "@/server/actions/persona";
import { useDeleteAction } from "@/hooks/use-delete-action";
import { Trash2 } from "lucide-react";

type Props = {
  personaId: string;
  personaName: string;
  projectId: string;
};

export function DeletePersonaButton({ personaId, personaName, projectId }: Props) {
  const { open, setOpen, isPending, handleDelete } = useDeleteAction(
    () => deletePersona(personaId, projectId),
    "Failed to delete persona."
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        id="delete-persona-trigger"
        aria-label={`Delete persona "${personaName}"`}
        render={
          <Button variant="destructive" size="sm">
            <Trash2 className="size-4" />
            Delete
          </Button>
        }
      />

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Delete Persona?</DialogTitle>
          <DialogDescription>
            This will permanently delete the persona{" "}
            <span className="font-medium text-foreground">{personaName}</span>. This action
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
            id="confirm-delete-persona"
          >
            {isPending ? "Deleting…" : "Yes, delete persona"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
