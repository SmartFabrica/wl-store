import { BulkUpsertCategoriesRow, BulkUpsertModelChassisRow, BulkUpsertProductsRow } from "../types/db.types";

export interface RowError {
  row: number;
  reason: string;
}

export type NormalizeResult<T> = { value: T; error?: never } | { value?: never; error: RowError };

export const normalizeRow = (raw: unknown, index: number): NormalizeResult<BulkUpsertModelChassisRow> => {
  const source = (raw ?? {}) as Record<string, unknown>;

  // Satır numarasını kullanıcının dosyada gördüğü şekilde (başlık satırı dahil) döndürüyoruz
  const row = index + 2;

  const brand = String(source.brand ?? "")
    .trim()
    .toLocaleUpperCase("tr");
  const model = String(source.model ?? "")
    .trim()
    .toLocaleUpperCase("tr");
  const chassis = String(source.chassis ?? "")
    .trim()
    .toLocaleUpperCase("tr");

  if (!brand) return { error: { row, reason: "Marka adı boş" } };
  if (!model) return { error: { row, reason: "Model adı boş" } };
  if (!chassis) return { error: { row, reason: "Kasa adı boş" } };

  return { value: { brand, model, chassis } };
};

export const normalizeCategoryRow = (raw: unknown, index: number): NormalizeResult<BulkUpsertCategoriesRow> => {
  const source = (raw ?? {}) as Record<string, unknown>;

  const row = index + 2;

  const category = String(source.category ?? "")
    .trim()
    .toLocaleUpperCase("tr");

  if (!category) return { error: { row, reason: "Kategori adı boş" } };

  return { value: { category } };
};

const parsePrice = (raw: unknown): string | null | false => {
  if (raw === null || raw === undefined) return null;
  if (typeof raw === "number") return Number.isFinite(raw) ? String(raw) : false;

  const text = String(raw).trim().replace(/\s/g, "");
  if (!text) return null;

  const hasDot = text.includes(".");
  const hasComma = text.includes(",");

  const normalized = hasDot && hasComma ? text.replace(/\./g, "").replace(",", ".") : text.replace(",", ".");

  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return false;

  return normalized;
};

const parsePriceVisible = (raw: unknown): boolean => {
  if (typeof raw === "boolean") return raw;

  const text = String(raw ?? "")
    .trim()
    .toLocaleLowerCase("tr");

  return ["true", "1", "evet", "e", "var", "görünür"].includes(text);
};

export const normalizeProductRow = (raw: unknown, index: number): NormalizeResult<BulkUpsertProductsRow> => {
  const source = (raw ?? {}) as Record<string, unknown>;

  const row = index + 2;

  const brand = String(source.brand ?? "")
    .trim()
    .toLocaleUpperCase("tr");
  const category = String(source.category ?? "")
    .trim()
    .toLocaleUpperCase("tr");
  const model = String(source.model ?? "")
    .trim()
    .toLocaleUpperCase("tr");
  const chassis = String(source.chassis ?? "")
    .trim()
    .toLocaleUpperCase("tr");
  const title = String(source.title ?? "").trim();
  const mpn = String(source.mpn ?? "")
    .trim()
    .toUpperCase();

  const missing: string[] = [];
  if (!brand) missing.push("Marka");
  if (!category) missing.push("Kategori");
  if (!model) missing.push("Model");
  if (!chassis) missing.push("Kasa");
  if (!title) missing.push("Ürün adı");
  if (!mpn) missing.push("MPN");

  if (missing.length > 0) {
    return { error: { row, reason: `${missing.join(", ")} alanı boş bırakılamaz` } };
  }

  const price = parsePrice(source.price);
  if (price === false) {
    return { error: { row, reason: `Fiyat sayısal olmalı: "${String(source.price)}"` } };
  }

  return {
    value: {
      brand,
      category,
      model,
      chassis,
      title,
      mpn,
      price,
      price_visible: parsePriceVisible(source.price_visible),
    },
  };
};
