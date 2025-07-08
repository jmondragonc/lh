import type { LonghornAuthenticatedRequest } from "./longhorn-auth";

// Re-export for convenience
export type { LonghornAuthenticatedRequest } from "./longhorn-auth";

// Gift Cards
export interface CreateGiftCardRequestBody {
  code: string;
  initial_value: string | number;
  currency?: string;
  expiration_date?: string | Date;
  customer_id?: string;
  order_id?: string;
  notes?: string;
  sender_name?: string;
  recipient_name?: string;
  recipient_email?: string;
  message?: string;
  delivery_status?: string;
  metadata?: Record<string, any>;
}

export interface UpdateGiftCardRequestBody {
  is_active?: boolean;
  expiration_date?: string | Date;
  notes?: string;
  sender_name?: string;
  recipient_name?: string;
  recipient_email?: string;
  message?: string;
  delivery_status?: string;
  metadata?: Record<string, any>;
}

export interface CreateGiftCardTransactionRequestBody {
  transaction_type: string;
  amount: string | number;
  customer_id?: string;
  order_id?: string;
  reference_id?: string;
  description?: string;
  notes?: string;
  metadata?: Record<string, any>;
}

export interface GenerateGiftCardCodeRequestBody {
  prefix?: string;
}

// Roles
export interface CreateRoleRequestBody {
  name: string;
  type: string;
  description?: string;
  permissions?: string[];
  is_active?: boolean;
  simulate_user?: string;
}

export interface UpdateRoleRequestBody {
  name?: string;
  type?: string;
  description?: string;
  permissions?: string[];
  is_active?: boolean;
}

// Users
export interface CreateUserRequestBody {
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
}

export interface UpdateUserRequestBody {
  first_name?: string;
  last_name?: string;
  email?: string;
  avatar_url?: string;
  metadata?: Record<string, any>;
}

export interface CreateUserRoleRequestBody {
  role_id: string;
  store_id?: string;
  metadata?: Record<string, any>;
}

export interface UpdateUserRoleRequestBody {
  role_id: string;
  store_id?: string;
}

// Stores
export interface CreateStoreRequestBody {
  name: string;
  code: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  business_hours?: Record<string, any>;
  delivery_settings?: Record<string, any>;
  metadata?: Record<string, any>;
}

// Gift Cards Store
export interface PurchaseGiftCardRequestBody {
  amount: string | number;
  currency?: string;
  recipient_email: string;
  recipient_name?: string;
  sender_name?: string;
  sender_email?: string;
  message?: string;
  delivery_date?: string | Date;
  payment_method?: string;
  customer_info?: Record<string, any>;
}

export interface RedeemGiftCardRequestBody {
  amount: string | number;
  order_id?: string;
  customer_email?: string;
}

// Typed request interfaces
export interface LonghornCreateGiftCardRequest extends LonghornAuthenticatedRequest {
  body: CreateGiftCardRequestBody;
}

export interface LonghornUpdateGiftCardRequest extends LonghornAuthenticatedRequest {
  body: UpdateGiftCardRequestBody;
}

export interface LonghornCreateGiftCardTransactionRequest extends LonghornAuthenticatedRequest {
  body: CreateGiftCardTransactionRequestBody;
}

export interface LonghornGenerateGiftCardCodeRequest extends LonghornAuthenticatedRequest {
  body: GenerateGiftCardCodeRequestBody;
}

export interface LonghornCreateRoleRequest extends LonghornAuthenticatedRequest {
  body: CreateRoleRequestBody;
}

export interface LonghornUpdateRoleRequest extends LonghornAuthenticatedRequest {
  body: UpdateRoleRequestBody;
}

export interface LonghornCreateUserRequest extends LonghornAuthenticatedRequest {
  body: CreateUserRequestBody;
}

export interface LonghornUpdateUserRequest extends LonghornAuthenticatedRequest {
  body: UpdateUserRequestBody;
}

export interface LonghornCreateUserRoleRequest extends LonghornAuthenticatedRequest {
  body: CreateUserRoleRequestBody;
}

export interface LonghornUpdateUserRoleRequest extends LonghornAuthenticatedRequest {
  body: UpdateUserRoleRequestBody;
}

export interface LonghornCreateStoreRequest extends LonghornAuthenticatedRequest {
  body: CreateStoreRequestBody;
}

export interface LonghornPurchaseGiftCardRequest extends LonghornAuthenticatedRequest {
  body: PurchaseGiftCardRequestBody;
}

export interface LonghornRedeemGiftCardRequest extends LonghornAuthenticatedRequest {
  body: RedeemGiftCardRequestBody;
}
