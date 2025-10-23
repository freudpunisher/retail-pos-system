
export enum RoleEnum {
  ADMIN = 'admin',
  MANAGER = 'manager',
  CASHIER = 'cashier',
  STOCK_MANAGER = 'stock_manager',
}

export interface PointVente {
  id: string;
  nom: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  phone: string;
  role: RoleEnum;
  is_active: boolean;
  last_login: string | null;
  password?: string; // Optional since not always returned (e.g., in login response)
  point_vente?: PointVente; // Added for login response
}

export interface CreateUserRequest {
  username: string;
  email: string;
  phone: string;
  role: RoleEnum;
  password: string;
}
