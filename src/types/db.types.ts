import { UserRole, UserStatus } from "./common.types";

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

export interface ProductRow {
  id: string;
  title: string;
  mpn: string;
  description: string;
  created_at: Date;
  updated_at: Date;
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
