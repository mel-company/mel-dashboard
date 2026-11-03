import { Loader2, X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

type Props = {
  deleteId: string | null;
  setDeleteId: (id: string | null) => void;
  isDeleting: boolean;
  handleDelete: () => void;
  employeeName?: string | null;
};

const EmployeeDeleteModal = ({
  deleteId,
  setDeleteId,
  isDeleting,
  handleDelete,
  employeeName,
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
            حذف الموظف
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
            {employeeName
              ? `هل أنت متأكد من حذف ${employeeName}`
              : "هل أنت متأكد من حذف الموظف"}
          </p>
          <p className="mx-auto max-w-[34rem] text-xs leading-6 text-slate-400 dark:text-[#a4b1fa] sm:text-base sm:leading-7">
            سيتم إيقاف وصوله للوحة التحكم فوراً، ويمكنك إضافة موظف جديد لاحقاً
            ضمن حد المقاعد في خطتك.
          </p>
        </div>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-start">
          <button
            type="button"
            disabled={isDeleting}
            onClick={handleDelete}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-[#ff5252]/40 bg-[#ff5252]/5 px-6 text-sm font-semibold text-[#ff5252] transition hover:bg-[#ff5252]/12 disabled:opacity-50"
          >
            {isDeleting ? <Loader2 className="size-4 animate-spin" /> : null}
            تأكيد الحذف
          </button>
          <button
            type="button"
            disabled={isDeleting}
            onClick={() => setDeleteId(null)}
            className="inline-flex h-12 items-center justify-center rounded-full border border-violet-500/20 bg-violet-500/10 px-6 text-sm font-semibold text-violet-700 transition hover:bg-violet-500/15 dark:border-[#9a5cff]/25 dark:bg-[#9a5cff]/10 dark:text-[#b282ff]"
          >
            إلغاء
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EmployeeDeleteModal;
