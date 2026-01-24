import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2 } from "lucide-react";

export interface DeleteTicketDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ticketTitle?: string;
  onConfirm: () => void;
  isPending?: boolean;
}

const DeleteTicketDialog = ({
  open,
  onOpenChange,
  ticketTitle,
  onConfirm,
  isPending = false,
}: DeleteTicketDialogProps) => {
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
            <Trash2 className="size-5 text-destructive" />
            حذف التذكرة
          </DialogTitle>
          <DialogDescription className="text-right">
            هل أنت متأكد من حذف هذه التذكرة
            {ticketTitle ? ` «${ticketTitle}»` : ""}؟ سيتم إخفاؤها من قائمتك ولا يمكن التراجع عن هذا الإجراء.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 md:justify-start flex-col">
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isPending}
            className="gap-2"
          >
            {isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Trash2 className="size-4" />
            )}
            نعم، حذف التذكرة
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

export default DeleteTicketDialog;
