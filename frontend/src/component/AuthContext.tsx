import React, { createContext, useContext, useEffect, useState } from 'react';

type Role = 'ADMIN' | 'USER' | null;

interface AuthContextType {
  token: string | null;
  role: Role;
  username: string | null;
  email: string | null;
  login: (token: string, role: Role, username: string, email: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<Role>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    // โหลดจาก localStorage ตอนเริ่ม
    const storedToken = localStorage.getItem('token');
    const storedRole = localStorage.getItem('role') as Role;
    const storedUsername = localStorage.getItem('name');
    const storedEmail = localStorage.getItem('email');

    if (storedToken) setToken(storedToken);
    if (storedRole) setRole(storedRole);
    if (storedUsername) setUsername(storedUsername);
    if (storedEmail) setEmail(storedEmail);
  }, []);

  const login = (token: string, role: Role, username: string, email: string) => {
    setToken(token);
    setRole(role);
    setUsername(username);  
    setEmail(email);

    localStorage.setItem('token', token);
    localStorage.setItem('role', role || '');
    localStorage.setItem('name', username);  
    localStorage.setItem('email', email);
  };

  const logout = () => {
    setToken(null);
    setRole(null);
    setUsername(null);
    setEmail(null);

    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('name');
    localStorage.removeItem('email');
  };

  return (
    <AuthContext.Provider value={{ token, role, username, email, login, logout }}>
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
