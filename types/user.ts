export enum RoleEnum {
  ADMIN = 'admin',
  MANAGER = 'manager',
  CASHIER = 'cashier',
  STOCK_MANAGER = 'stock_manager',
}

export interface User {
  id: string;
  username: string;
  email: string;
  phone: string;
  role: RoleEnum;
  is_active: boolean;
  last_login: string;
  password: string;
}

export interface CreateUserRequest {
  username: string;
  email: string;
  phone: string;
  role: RoleEnum;
  password: string;
}