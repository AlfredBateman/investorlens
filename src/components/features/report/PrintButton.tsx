"use client";

import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

/** The browser's print dialog is the PDF exporter ("Save as PDF"), so no PDF library. */
export function PrintButton() {
  return (
    <Button onClick={() => window.print()} className="gap-1.5">
      <Printer className="size-4" aria-hidden />
      Print / Save as PDF
    </Button>
  );
}
