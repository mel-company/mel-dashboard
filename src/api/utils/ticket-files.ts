export const TICKET_MAX_FILES = 5;
export const TICKET_MAX_FILE_SIZE = 5 * 1024 * 1024;

export const TICKET_ACCEPTED_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
] as const;

export const TICKET_FILE_ACCEPT =
  "image/jpeg,image/png,image/webp,image/gif,application/pdf";

export function appendTicketFiles(formData: FormData, files?: File[]) {
  files?.forEach((file) => formData.append("files", file));
}

export function isTicketImageMime(mimeType?: string | null): boolean {
  return !!mimeType?.startsWith("image/");
}

export function validateTicketFiles(files: File[]): string | null {
  if (files.length > TICKET_MAX_FILES) {
    return `الحد الأقصى ${TICKET_MAX_FILES} ملفات`;
  }

  for (const file of files) {
    if (!TICKET_ACCEPTED_MIME_TYPES.includes(file.type as (typeof TICKET_ACCEPTED_MIME_TYPES)[number])) {
      return `نوع الملف غير مدعوم: ${file.name}`;
    }
    if (file.size > TICKET_MAX_FILE_SIZE) {
      return `حجم الملف ${file.name} يتجاوز 5MB`;
    }
  }

  return null;
}
