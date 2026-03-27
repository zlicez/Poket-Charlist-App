import * as React from "react";
import { createContext, useContext } from "react";
import { useMediaQuery } from "@/hooks/use-media-query";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

const ResponsiveContext = createContext<boolean>(true);

function useIsDesktop() {
  return useContext(ResponsiveContext);
}

interface ResponsiveDialogProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

function ResponsiveDialog({ children, open, onOpenChange }: ResponsiveDialogProps) {
  const isDesktop = useMediaQuery("(min-width: 640px)");

  return (
    <ResponsiveContext.Provider value={isDesktop}>
      {isDesktop ? (
        <Dialog open={open} onOpenChange={onOpenChange}>
          {children}
        </Dialog>
      ) : (
        <Drawer open={open} onOpenChange={onOpenChange}>
          {children}
        </Drawer>
      )}
    </ResponsiveContext.Provider>
  );
}

function ResponsiveDialogTrigger({ children, asChild, ...props }: { children: React.ReactNode; asChild?: boolean; className?: string }) {
  const isDesktop = useIsDesktop();
  if (isDesktop) {
    return <DialogTrigger asChild={asChild} {...props}>{children}</DialogTrigger>;
  }
  return <DrawerTrigger asChild={asChild} {...props}>{children}</DrawerTrigger>;
}

function ResponsiveDialogContent({ children, className, ...props }: { children: React.ReactNode; className?: string }) {
  const isDesktop = useIsDesktop();
  if (isDesktop) {
    return <DialogContent className={className} {...props}>{children}</DialogContent>;
  }
  return (
    <DrawerContent {...props}>
      <div className={`max-h-[85vh] overflow-y-auto px-4 pb-4 ${className || ""}`}>
        {children}
      </div>
    </DrawerContent>
  );
}

function ResponsiveDialogHeader({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const isDesktop = useIsDesktop();
  if (isDesktop) {
    return <DialogHeader className={className} {...props}>{children}</DialogHeader>;
  }
  return <DrawerHeader className={className} {...props}>{children}</DrawerHeader>;
}

function ResponsiveDialogTitle({ children, className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  const isDesktop = useIsDesktop();
  if (isDesktop) {
    return <DialogTitle className={className} {...props}>{children}</DialogTitle>;
  }
  return <DrawerTitle className={className} {...props}>{children}</DrawerTitle>;
}

function ResponsiveDialogDescription({ children, className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  const isDesktop = useIsDesktop();
  if (isDesktop) {
    return <DialogDescription className={className} {...props}>{children}</DialogDescription>;
  }
  return <DrawerDescription className={className} {...props}>{children}</DrawerDescription>;
}

function ResponsiveDialogFooter({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const isDesktop = useIsDesktop();
  if (isDesktop) {
    return <DialogFooter className={className} {...props}>{children}</DialogFooter>;
  }
  return <DrawerFooter className={className} {...props}>{children}</DrawerFooter>;
}

function ResponsiveDialogClose({ children, asChild, ...props }: { children: React.ReactNode; asChild?: boolean }) {
  const isDesktop = useIsDesktop();
  if (isDesktop) {
    return <DialogClose asChild={asChild} {...props}>{children}</DialogClose>;
  }
  return <DrawerClose asChild={asChild} {...props}>{children}</DrawerClose>;
}

export {
  ResponsiveDialog,
  ResponsiveDialogTrigger,
  ResponsiveDialogContent,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
  ResponsiveDialogClose,
};
