'use client';

import { Fragment, ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  if (!open) return null;

  return (
    <Fragment>
      <div
        className="dialog-overlay"
        onClick={() => onOpenChange(false)}
        aria-hidden="true"
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="dialog-content"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
        >
          {children}
        </div>
      </div>
    </Fragment>
  );
}

interface DialogTriggerProps {
  children: ReactNode;
}

export function DialogTrigger({ children }: DialogTriggerProps) {
  return <>{children}</>;
}

interface DialogContentProps {
  children: ReactNode;
  className?: string;
}

export function DialogContent({ children, className }: DialogContentProps) {
  return (
    <div className={cn('flex flex-col', className)}>
      {children}
    </div>
  );
}

interface DialogHeaderProps {
  children: ReactNode;
  className?: string;
}

export function DialogHeader({ children, className }: DialogHeaderProps) {
  return (
    <div className={cn('dialog-header', className)}>
      {children}
    </div>
  );
}

interface DialogTitleProps {
  children: ReactNode;
  className?: string;
}

export function DialogTitle({ children, className }: DialogTitleProps) {
  return (
    <h2 className={cn('dialog-title', className)}>
      {children}
    </h2>
  );
}

interface DialogDescriptionProps {
  children: ReactNode;
  className?: string;
}

export function DialogDescription({ children, className }: DialogDescriptionProps) {
  return (
    <p className={cn('text-sm text-slate-400', className)}>
      {children}
    </p>
  );
}

interface DialogFooterProps {
  children: ReactNode;
  className?: string;
}

export function DialogFooter({ children, className }: DialogFooterProps) {
  return (
    <div className={cn('dialog-footer', className)}>
      {children}
    </div>
  );
}

interface DialogCloseProps {
  className?: string;
}

export function DialogClose({ className }: DialogCloseProps) {
  return (
    <button
      className={cn('dialog-close', className)}
      aria-label="Close"
    >
      <X className="h-4 w-4" />
    </button>
  );
}