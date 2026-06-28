import { FileText } from "lucide-react";
import type { TicketAttachment } from "@/api/types/ticket";
import { isTicketImageMime } from "@/api/utils/ticket-files";

type TicketAttachmentGalleryProps = {
  attachments: TicketAttachment[];
  compact?: boolean;
};

const TicketAttachmentGallery = ({
  attachments,
  compact = false,
}: TicketAttachmentGalleryProps) => {
  if (!attachments.length) return null;

  const images = attachments.filter((a) => isTicketImageMime(a.mimeType));
  const others = attachments.filter((a) => !isTicketImageMime(a.mimeType));

  if (compact) {
    return (
      <div className="mt-2 flex flex-wrap gap-2">
        {images.map((file) => (
          <a
            key={file.id}
            href={file.url}
            target="_blank"
            rel="noreferrer"
            className="block overflow-hidden rounded-lg"
          >
            <img
              src={file.url}
              alt={file.fileName ?? "مرفق"}
              className="max-h-32 max-w-[160px] rounded-lg object-cover"
            />
          </a>
        ))}
        {others.map((file) => (
          <a
            key={file.id}
            href={file.url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 rounded-lg bg-white/20 px-2 py-1 text-xs underline"
          >
            <FileText className="size-3.5 shrink-0" />
            {file.fileName ?? "PDF"}
          </a>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {images.length > 0 && (
        <div className="overflow-hidden rounded-2xl bg-slate-100 p-2">
          <a href={images[0].url} target="_blank" rel="noreferrer">
            <img
              src={images[0].url}
              alt={images[0].fileName ?? "مرفق"}
              className="aspect-video w-full rounded-xl object-cover"
            />
          </a>
          {images.length > 1 && (
            <div className="mt-2 grid grid-cols-4 gap-1.5">
              {images.slice(1, 5).map((file) => (
                <a key={file.id} href={file.url} target="_blank" rel="noreferrer">
                  <img
                    src={file.url}
                    alt={file.fileName ?? ""}
                    className="aspect-square rounded-lg object-cover"
                  />
                </a>
              ))}
            </div>
          )}
        </div>
      )}
      {others.length > 0 && (
        <div className="flex flex-col gap-1.5">
          {others.map((file) => (
            <a
              key={file.id}
              href={file.url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-sm text-slate-700 hover:bg-slate-200"
            >
              <FileText className="size-4 shrink-0 text-red-500" />
              <span className="truncate">{file.fileName ?? "ملف PDF"}</span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
};

export default TicketAttachmentGallery;
