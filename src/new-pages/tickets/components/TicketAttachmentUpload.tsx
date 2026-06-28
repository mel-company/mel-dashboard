import { useRef } from "react";
import { FileText, ImagePlus, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { SettingsLabel } from "@/new-pages/settings/components/SettingsField";
import {
  TICKET_ACCEPTED_MIME_TYPES,
  TICKET_FILE_ACCEPT,
  TICKET_MAX_FILES,
  TICKET_MAX_FILE_SIZE,
} from "@/api/utils/ticket-files";

type TicketAttachmentUploadProps = {
  files: File[];
  onChange: (files: File[]) => void;
  disabled?: boolean;
  label?: string;
};

const TicketAttachmentUpload = ({
  files,
  onChange,
  disabled,
  label = "أضافة مرفقات للدعم",
}: TicketAttachmentUploadProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (list: FileList | null) => {
    if (!list) return;
    const next = [...files];

    for (const file of Array.from(list)) {
      if (next.length >= TICKET_MAX_FILES) {
        toast.error(`الحد الأقصى ${TICKET_MAX_FILES} ملفات`);
        break;
      }
      if (
        !TICKET_ACCEPTED_MIME_TYPES.includes(
          file.type as (typeof TICKET_ACCEPTED_MIME_TYPES)[number],
        )
      ) {
        toast.error(`نوع الملف غير مدعوم: ${file.name}`);
        continue;
      }
      if (file.size > TICKET_MAX_FILE_SIZE) {
        toast.error(`حجم الملف يتجاوز 5MB: ${file.name}`);
        continue;
      }
      next.push(file);
    }

    onChange(next);
  };

  const removeFile = (index: number) => {
    onChange(files.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      <SettingsLabel>{label}</SettingsLabel>
      <div className="rounded-2xl bg-slate-100 p-3">
        <button
          type="button"
          disabled={disabled || files.length >= TICKET_MAX_FILES}
          onClick={() => inputRef.current?.click()}
          className={cn(
            "flex w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-slate-300 bg-white px-4 py-10 transition-colors hover:border-sky-300 hover:bg-sky-50/40",
            (disabled || files.length >= TICKET_MAX_FILES) &&
              "cursor-not-allowed opacity-60",
          )}
        >
          <div className="flex size-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
            <ImagePlus className="size-6" />
          </div>
          <p className="text-sm font-medium text-slate-600">اضافة صورة أو PDF</p>
          <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-medium text-violet-700">
            PNG, JPG, WEBP, GIF, PDF — حتى 5MB
          </span>
        </button>

        <input
          ref={inputRef}
          type="file"
          accept={TICKET_FILE_ACCEPT}
          multiple
          className="hidden"
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = "";
          }}
        />

        {files.length > 0 && (
          <div className="mt-3 grid grid-cols-4 gap-2">
            {files.map((file, index) => (
              <div key={`${file.name}-${index}`} className="relative">
                {file.type === "application/pdf" ? (
                  <div className="flex aspect-square flex-col items-center justify-center gap-1 rounded-xl bg-white p-2 text-center">
                    <FileText className="size-6 text-red-500" />
                    <span className="line-clamp-2 text-[10px] text-slate-600">
                      {file.name}
                    </span>
                  </div>
                ) : (
                  <img
                    src={URL.createObjectURL(file)}
                    alt=""
                    className="aspect-square rounded-xl object-cover"
                  />
                )}
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="absolute -left-1 -top-1 flex size-5 items-center justify-center rounded-full bg-red-500 text-white"
                  aria-label="حذف"
                >
                  <X className="size-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketAttachmentUpload;
