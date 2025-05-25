export type UserRole = 'ADMIN' | 'USER';

export interface RegisterData {
  email: string;
  name: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface User {
  user_id: number;
  email: string;
  name: string;
  role: UserRole;
}

export interface AuthResponse {
  token: string;
  user: {
    user_id: number; // Use user_id to match User interface
    email: string;
    name: string;
    role: UserRole;
  };
}