import { Loader2, X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

type Props = {
  deleteId: string | null;
  setDeleteId: (id: string | null) => void;
  isDeleting: boolean;
  handleDelete: () => void;
  /** Shown in the confirmation so the merchant can see who they are removing. */
  customerName?: string | null;
};

/**
 * Matches the confirmation Figma draws and the other five delete modals in
 * this app already use: red title on the right, close on the left, the
 * consequence spelled out, and the destructive action as the quieter of the
 * two. This one was a generic alert dialog with none of that.
 */
const CustomerDeleteModal = ({
  deleteId,
  setDeleteId,
  isDeleting,
  handleDelete,
  customerName,
}: Props) => {
  return (
    <Dialog
      open={!!deleteId}
      onOpenChange={(open) => !isDeleting && !open && setDeleteId(null)}
    >
      <DialogContent
        dir="rtl"
        showCloseButton={false}
        className="max-h-[92dvh] gap-6 overflow-y-auto rounded-[2rem] border-0 bg-white p-6 text-right shadow-2xl sm:max-w-[560px] dark:bg-[#12183b]"
      >
        <div className="flex items-center justify-between">
          <DialogTitle className="text-xl font-bold text-[#ff5252] sm:text-2xl">
            حذف العميل
          </DialogTitle>
          <button
            type="button"
            disabled={isDeleting}
            onClick={() => setDeleteId(null)}
            className="flex size-12 items-center justify-center rounded-[14px] border border-[#ff5252]/20 text-[#ff5252] transition-colors hover:bg-[#ff5252]/10 disabled:opacity-50"
            aria-label="إغلاق"
          >
            <X className="size-5" strokeWidth={2.5} />
          </button>
        </div>

        <div className="space-y-3 text-center sm:space-y-4">
          <p className="text-lg font-bold text-slate-800 dark:text-[#e4e7fc] sm:text-2xl">
            {customerName
              ? `هل أنت متأكد من حذف ${customerName}`
              : "هل أنت متأكد من حذف العميل"}
          </p>
          <p className="mx-auto max-w-[34rem] text-xs leading-6 text-slate-400 dark:text-[#a4b1fa] sm:text-base sm:leading-7">
            سوف تقوم بحذف العميل من النظام ولن تستطيع إعادته مرة أخرى، وسيبقى
            سجل طلباته السابقة كما هو.
          </p>
        </div>

        <div className="flex flex-col items-stretch gap-3 sm:flex-row-reverse sm:gap-8">
          <button
            type="button"
            disabled={isDeleting}
            onClick={() => setDeleteId(null)}
            className="flex h-12 w-full items-center justify-center rounded-2xl bg-slate-100 text-base font-bold text-slate-700 transition-colors hover:bg-slate-200 disabled:opacity-50 sm:h-[60px] sm:text-lg dark:bg-white/[0.06] dark:text-[#e4e7fc] dark:hover:bg-white/10"
          >
            إلغاء
          </button>
          <button
            type="button"
            disabled={isDeleting}
            onClick={handleDelete}
            className="flex h-11 w-full items-center justify-center text-base font-bold text-slate-700 transition-colors hover:text-rose-600 disabled:opacity-50 sm:h-[60px] sm:text-lg dark:text-[#e4e7fc] dark:hover:text-[#ff5252]"
          >
            {isDeleting ? (
              <>
                <Loader2 className="me-2 size-4 animate-spin" />
                جاري الحذف...
              </>
            ) : (
              "حذف العميل"
            )}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CustomerDeleteModal;
