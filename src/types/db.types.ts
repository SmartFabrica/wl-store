import { QuoteStatus, UserRole, UserStatus } from "./common.types";

export interface CategoryRow {
  id: string;
  name: string;
  created_at: Date;
  updated_at: Date;
}

export interface BrandRow {
  id: string;
  name: string;
  created_at: Date;
  updated_at: Date;
}

export interface BrandModelRow {
  id: string;
  brand_id: string;
  name: string;
  created_at: Date;
  updated_at: Date;
}

export interface BrandModelChassisRow {
  id: string;
  model_id: string;
  name: string;
  created_at: Date;
  updated_at: Date;
}

export interface UserRow {
  id: string;
  email: string;
  password_hash: string;
  role: UserRole;
  status: UserStatus;
  created_at: Date;
  updated_at: Date;
}

export interface CorporateProfileRow {
  id: string;
  user_id: string;
  company_name: string;
  tax_number: string;
  tax_office: string;
  phone: string;
  address: string;
  created_at: Date;
  updated_at: Date;
}

export interface IndividualProfileRow {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  phone: string;
  created_at: Date;
  updated_at: Date;
}

interface ProductSpecs {
  key: string;
  value: string;
}

export interface ProductRow {
  id: string;
  brand_id: string;
  category_id: string;
  title: string;
  mpn: string;
  description: string | null;
  specs: ProductSpecs[] | null | string;
  price: string | null;
  price_visible: boolean | null;
  created_at: Date;
  updated_at: Date;
}

export interface ProductCompatibilityRow {
  id: string;
  product_id: string;
  model_id: string;
  chassis_id: string;
  created_at: Date;
}

export interface ProductImageRow {
  id: string;
  product_id: string;
  image_url: string;
  is_main: boolean;
  created_at: Date;
}

export type ProductCompatDetail = Omit<ProductCompatibilityRow, "product_id" | "created_at">;

export interface ProductDetail extends ProductRow {
  compat: ProductCompatDetail[];
}

export interface CorporateUser extends UserRow {
  profile: Omit<CorporateProfileRow, "id" | "user_id" | "created_at" | "updated_at">;
}

export interface IndividualUser extends UserRow {
  profile: Omit<IndividualProfileRow, "id" | "user_id" | "created_at" | "updated_at">;
}

export type CorporateUserRawJoin = UserRow & Omit<CorporateProfileRow, "id" | "created_at" | "updated_at">;
export type IndividualUserRawJoin = UserRow & Omit<IndividualProfileRow, "id" | "created_at" | "updated_at">;

export type UserAggregate = CorporateUser | IndividualUser;

export interface QuoteRow {
  id: string;
  quote_number: string;
  buyer_id: string;
  vendor_id: string;
  status: QuoteStatus;
  shipping_address: string;
  billing_address?: string;
  buyer_note?: string;
  created_at: Date;
  updated_at: Date;
}

export interface QuoteItemRow {
  id: string;
  quote_id: string;
  product_id: string;
  quantity: number;
  created_at: Date;
}
