export interface User {
  id: number;
  username: string;
  email: string;
  phone?: string;
  is_admin: boolean;
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
