interface Pagination {
  page: number;
  limit: number;
  total_items: number;
  total_pages: number;
}

export interface APIResponse<T = {}> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[] | string;
  pagination?: Pagination;
}

export enum HTTPStatus {
  OK = 200,
  CREATED = 201,
  ACCEPTED = 202,
  NO_CONTENT = 204,

  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  UNPROCESSABLE_ENTITY = 422,

  INTERNAL_SERVER_ERROR = 500,
}

export enum UserRole {
  ADMIN = "admin",
  INDIVIDUAL = "individual",
  CORPORATE = "corporate",
}

export enum UserStatus {
  PENDING = "pending",
  APPROVED = "approved",
}

export enum QuoteStatus {
  PENDING = "pending",
  APPROVED = "approved",
  SHIPPED = "shipped",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}
