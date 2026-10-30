'use client';

import type { ReactNode } from 'react';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';

/** Controlled confirmation dialog props; business rules are supplied by the caller. */
export type ActionDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  detail?: ReactNode;
  children?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  pending?: boolean;
  confirmDisabled?: boolean;
  onConfirm: () => void | Promise<void>;
};

export function ActionDialog({
  open,
  onOpenChange,
  title,
  description,
  detail,
  children,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  pending = false,
  confirmDisabled = false,
  onConfirm,
}: ActionDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => !pending && onOpenChange(nextOpen)}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        {detail}
        {children}
        <DialogFooter className="flex-col-reverse sm:flex-row">
          <Button
            type="button"
            variant="outline"
            size="touch"
            disabled={pending}
            onClick={() => onOpenChange(false)}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            size="touch"
            disabled={pending || confirmDisabled}
            onClick={() => void onConfirm()}
          >
            {pending ? 'Processing…' : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export type CancellationDialogProps = Omit<
  ActionDialogProps,
  'title' | 'description' | 'detail' | 'confirmLabel' | 'confirmDisabled'
> & {
  canCancel: boolean;
  availabilityDescription?: string;
};

/** Shows the agreed reminder that cancelling an application does not remove its pot. */
export function CancellationDialog({
  canCancel,
  availabilityDescription,
  ...props
}: CancellationDialogProps) {
  return (
    <ActionDialog
      {...props}
      title="Cancel your spot?"
      description={
        availabilityDescription ??
        'The buying group stays open even if you leave.'
      }
      confirmLabel="Leave group"
      confirmDisabled={!canCancel}
    />
  );
}

export type NotificationDialogProps = Omit<
  ActionDialogProps,
  'cancelLabel' | 'pending' | 'confirmDisabled'
>;

export function NotificationDialog(props: NotificationDialogProps) {
  return <ActionDialog {...props} cancelLabel="Close" />;
}
