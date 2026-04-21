import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from "@/components/ui/responsive-dialog";

interface AvatarViewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  avatarSrc: string;
  characterName: string;
}

export function AvatarViewModal({
  open,
  onOpenChange,
  avatarSrc,
  characterName,
}: AvatarViewModalProps) {
  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange}>
      <ResponsiveDialogContent className="sm:max-w-sm">
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>{characterName}</ResponsiveDialogTitle>
        </ResponsiveDialogHeader>
        <div className="flex justify-center py-2">
          <img
            src={avatarSrc}
            alt={characterName}
            className="w-full max-w-[320px] rounded-2xl object-cover shadow-lg"
          />
        </div>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
