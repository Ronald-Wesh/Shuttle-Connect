const toPositiveInt = (
  value: unknown,
  fallback: number,
  max?: number
): number => {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 1) {
    return fallback;
  }

  return max ? Math.min(parsed, max) : parsed;
};

export const getPagination = (query: Record<string, unknown>) => {
  const page = toPositiveInt(query.page, 1);
  const limit = toPositiveInt(query.limit, 20, 100);
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  return { page, limit, from, to };
};

export const getPaginationMeta = (
  page: number,
  limit: number,
  total?: number | null
) => ({
  page,
  limit,
  total: total ?? 0,
  totalPages: total ? Math.ceil(total / limit) : 0
});
