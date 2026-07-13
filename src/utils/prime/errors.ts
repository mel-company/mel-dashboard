type PrimeApiErrorData = {
  message?: string | string[];
  errorMessage?: string;
  errorCode?: number;
  errorType?: string;
  source?: string;
};

export function getPrimeApiError(error: unknown, fallback: string): string {
  const apiError = error as Error & {
    response?: { data?: PrimeApiErrorData };
  };
  const data = apiError.response?.data;
  if (data?.errorMessage) {
    if (data.errorCode === 30) {
      if (data.errorType === "TOKEN") {
        return `${data.errorMessage} — جلسة Prime في الباكند غير صالحة لعمليات الشحن (حتى مع senderId صحيح). المطلوب من الباكند: استخدام accessToken من POST /prime/auth/login عند استدعاء calculate-charges و create-shipment.`;
      }
      return `${data.errorMessage} — تحقق من إعداد Prime (المحل/senderId) من الإعدادات`;
    }
    return data.errorMessage;
  }
  if (Array.isArray(data?.message)) return data.message.join(" — ");
  if (typeof data?.message === "string") return data.message;
  return fallback;
}
