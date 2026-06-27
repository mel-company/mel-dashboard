import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type Props = {
  deleteId: string | null;
  setDeleteId: (id: string | null) => void;
  isDeleting: boolean;
  handleDelete: () => void;
};

const CustomerDeleteModal = ({
  deleteId,
  setDeleteId,
  isDeleting,
  handleDelete,
}: Props) => {
  return (
    <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
      <AlertDialogContent dir="rtl" className="text-right">
        <AlertDialogHeader className="text-right">
          <AlertDialogTitle>تأكيد حذف العميل</AlertDialogTitle>
          <AlertDialogDescription>
            هل أنت متأكد من حذف هذا العميل؟ لا يمكن التراجع عن هذا الإجراء.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2 sm:gap-0">
          <AlertDialogCancel disabled={isDeleting}>إلغاء</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? "جاري الحذف..." : "حذف"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default CustomerDeleteModal;
