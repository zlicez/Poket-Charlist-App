import * as DialogPrimitive from "@radix-ui/react-dialog";
import { forwardRef } from "react";

import { cn } from "@/lib/utils";
import { typeClass } from "@/ds/tokens";

/**
 * DS BottomSheet — hero-компонент 4/4.
 * Handoff:
 *  - README §5 BottomSheet (Radix Dialog + кастом стили)
 *  - 02-system.jsx «BottomSheet (mobile)» — drag handle, title, body.
 *  - styles.css тени: shadow-ds-3 для popup'а, rgba(26,21,18,0.55) backdrop.
 *
 * MVP: без drag-to-dismiss (snapPoints) — только tap outside / Escape.
 * Drag gesture — Phase I polish (через vaul или @use-gesture/react).
 *
 * Animation:
 *   backdrop fade 160ms
 *   sheet slide-up 240ms ease-out
 *
 * Safe-area: бottom padding с env(safe-area-inset-bottom) для iOS.
 */

export interface BottomSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  /** По умолчанию sheet закрывается по tap outside / Escape. */
  dismissable?: boolean;
  className?: string;
}

const BottomSheetRoot = DialogPrimitive.Root;
const BottomSheetTrigger = DialogPrimitive.Trigger;
const BottomSheetClose = DialogPrimitive.Close;

const BottomSheetOverlay = forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-ink-900/55",
      "motion-safe:data-[state=open]:animate-in motion-safe:data-[state=open]:fade-in-0 motion-safe:data-[state=open]:duration-[160ms]",
      "motion-safe:data-[state=closed]:animate-out motion-safe:data-[state=closed]:fade-out-0 motion-safe:data-[state=closed]:duration-[160ms]",
      className,
    )}
    {...props}
  />
));
BottomSheetOverlay.displayName = "BottomSheetOverlay";

const BottomSheetContent = forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  Omit<React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>, "title"> & {
    title?: React.ReactNode;
    description?: React.ReactNode;
  }
>(({ className, children, title, description, ...props }, ref) => (
  <DialogPrimitive.Portal>
    <BottomSheetOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50",
        "bg-paper-card rounded-t-[20px] shadow-ds-3 border-t border-ink-200",
        "px-4 pt-4",
        "pb-[max(24px,env(safe-area-inset-bottom))]",
        "motion-safe:data-[state=open]:animate-in motion-safe:data-[state=open]:slide-in-from-bottom motion-safe:data-[state=open]:duration-[240ms]",
        "motion-safe:data-[state=closed]:animate-out motion-safe:data-[state=closed]:slide-out-to-bottom motion-safe:data-[state=closed]:duration-[200ms]",
        "max-h-[85vh] overflow-y-auto",
        className,
      )}
      {...props}
    >
      {/* Drag handle (visual only in MVP) */}
      <div
        aria-hidden
        className="mx-auto mb-3.5 h-1 w-[42px] rounded-full bg-ink-300"
      />
      {title && (
        <DialogPrimitive.Title asChild>
          <div className={cn(typeClass("h1"), "text-ink-900 mb-1")}>{title}</div>
        </DialogPrimitive.Title>
      )}
      {description && (
        <DialogPrimitive.Description asChild>
          <div className={cn(typeClass("body-sm"), "text-ink-500 mb-3")}>
            {description}
          </div>
        </DialogPrimitive.Description>
      )}
      {children}
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
));
BottomSheetContent.displayName = "BottomSheetContent";

export function BottomSheet({
  open,
  onOpenChange,
  title,
  description,
  children,
  dismissable = true,
  className,
}: BottomSheetProps) {
  return (
    <BottomSheetRoot open={open} onOpenChange={dismissable ? onOpenChange : undefined}>
      <BottomSheetContent
        className={className}
        title={title}
        description={description}
        onPointerDownOutside={dismissable ? undefined : (e) => e.preventDefault()}
        onEscapeKeyDown={dismissable ? undefined : (e) => e.preventDefault()}
      >
        {children}
      </BottomSheetContent>
    </BottomSheetRoot>
  );
}

export {
  BottomSheetRoot,
  BottomSheetTrigger,
  BottomSheetContent,
  BottomSheetClose,
  BottomSheetOverlay,
};
