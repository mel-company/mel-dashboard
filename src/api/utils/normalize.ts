export type MaybePaginatedListResponse<T> =
  | T[]
  | {
      data: T[];
      total?: number;
      page?: number;
      limit?: number;
    };

export type NormalizedListResponse<T> = {
  items: T[];
  total?: number;
  page?: number;
  limit?: number;
};

export function normalizeListResponse<T>(
  response: MaybePaginatedListResponse<T> | null | undefined
): NormalizedListResponse<T> {
  if (!response) return { items: [] };
  if (Array.isArray(response)) return { items: response };

  const data = Array.isArray(response.data) ? response.data : [];
  return {
    items: data,
    total: response.total,
    page: response.page,
    limit: response.limit,
  };
}


