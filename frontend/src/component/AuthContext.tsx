import React, { createContext, useContext, useEffect, useState } from 'react';

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
    user_id: number; 
    email: string;
    name: string;
    role: UserRole;
  };
}

interface AuthContextType {
  token: string | null;
  user: User | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

useEffect(() => {
  const storedToken = localStorage.getItem('token');
  const storedUser = localStorage.getItem('user');
  console.log('AuthProvider - storedToken:', storedToken);
  console.log('AuthProvider - storedUser:', storedUser);

  if (storedToken) {
    setToken(storedToken);
  }
  if (storedUser) {
    const parsedUser = JSON.parse(storedUser);
    console.log('AuthProvider - parsedUser:', parsedUser);
    const userId = parsedUser.user_id ?? parsedUser.userId;
    if (!userId || userId === 0) {
      console.error('Invalid user_id in localStorage');
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      setUser(null);
    } else {
      setUser({
        user_id: userId,
        email: parsedUser.email,
        name: parsedUser.name,
        role: parsedUser.role || 'USER',
      });
    }
  }

  setIsLoading(false);
}, []);
  const login = (token: string, user: User) => {
    setToken(token);
    setUser(user);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};