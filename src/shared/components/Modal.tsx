"use client";

import type { ReactElement, ReactNode } from "react";
import { Dialog } from "@base-ui/react/dialog";
import { X } from "lucide-react";

export function Modal({
  trigger,
  closeLabel,
  onOpenChange,
  children,
}: {
  trigger: ReactElement;
  closeLabel: string;
  onOpenChange?: (open: boolean) => void;
  children: ReactNode;
}) {
  return (
    <Dialog.Root onOpenChange={(open) => onOpenChange?.(open)}>
      <Dialog.Trigger render={trigger} />
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-foreground/40" />
        {/* The popup unmounts on close, so its content starts fresh on every opening. */}
        <Dialog.Popup className="fixed top-1/2 left-1/2 z-50 max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-3xl bg-background p-6 shadow-lg md:p-8">
          <Dialog.Close
            aria-label={closeLabel}
            className="absolute top-5 right-5 text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </Dialog.Close>
          {children}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export function ModalHeader({ title, description }: { title: ReactNode; description?: ReactNode }) {
  return (
    <div className="pr-6">
      <Dialog.Title className="font-serif text-2xl text-foreground">{title}</Dialog.Title>
      {description && (
        <Dialog.Description className="mt-1 text-sm text-muted-foreground">{description}</Dialog.Description>
      )}
    </div>
  );
}
