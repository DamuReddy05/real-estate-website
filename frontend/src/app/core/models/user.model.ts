export interface User {
  id: number;
  username: string;
  email: string;
  phone?: string;
  first_name?: string;
  last_name?: string;
  is_admin: boolean;
  role: 'admin' | 'customer';
  auth_provider?: string;
  phone_verified?: boolean;
  created_at: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user: User;
}

export interface ChangePasswordRequest {
  old_password: string;
  new_password: string;
}

export interface GoogleLoginRequest {
  id_token: string;
  phone?: string | null;
  role: 'admin' | 'customer';
}
