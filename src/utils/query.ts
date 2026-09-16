export const parseCsvList = (value: unknown): string[] | undefined => {
  if (typeof value !== "string") return undefined;

  const items = value
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);

  return items.length > 0 ? items : undefined;
};

export const parseText = (value: unknown): string | undefined => {
  if (typeof value !== "string") return undefined;

  const text = value.trim();
  return text.length > 0 ? text : undefined;
};

export const nameMatchCondition = (column: string, paramIndex: number): string =>
  `lower(${column}) = ANY(ARRAY(SELECT lower(n) FROM unnest($${paramIndex}::text[]) AS n))`;
