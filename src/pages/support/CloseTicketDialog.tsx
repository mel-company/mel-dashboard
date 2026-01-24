import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Lock } from "lucide-react";

export interface CloseTicketDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ticketTitle?: string;
  onConfirm: () => void;
  isPending?: boolean;
}

const CloseTicketDialog = ({
  open,
  onOpenChange,
  ticketTitle,
  onConfirm,
  isPending = false,
}: CloseTicketDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-md"
        dir="rtl"
        onPointerDownOutside={(e) => {
          if (isPending) e.preventDefault();
        }}
        onEscapeKeyDown={(e) => {
          if (isPending) e.preventDefault();
        }}
      >
        <DialogHeader className="text-right">
          <DialogTitle className="flex items-center gap-2">
            <Lock className="size-5 text-destructive" />
            إغلاق التذكرة
          </DialogTitle>
          <DialogDescription className="text-right">
            هل أنت متأكد من إغلاق هذه التذكرة
            {ticketTitle ? ` «${ticketTitle}»` : ""}؟ لن تتمكن من إضافة ردود جديدة بعد الإغلاق.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 md:justify-start flex-col">
          <Button
            variant="default"
            onClick={onConfirm}
            disabled={isPending}
            className="gap-2"
          >
            {isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Lock className="size-4" />
            )}
            نعم، إغلاق التذكرة
          </Button>
          <Button
            variant="secondary"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            إلغاء
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CloseTicketDialog;
