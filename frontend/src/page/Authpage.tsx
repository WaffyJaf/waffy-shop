import React, { createContext, useContext, useEffect, useState } from 'react';

type Role = 'ADMIN' | 'USER' | null;

interface AuthContextType {
  token: string | null;
  role: Role;
  username: string | null;
  email: string | null;
  user_id: number | null; 
  login: (token: string, role: Role, username: string, email: string, user_id: number) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<Role>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [user_id, setUserId] = useState<number | null>(null); // เพิ่ม state สำหรับ user_id

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedRole = localStorage.getItem('role') as Role;
    const storedUsername = localStorage.getItem('name');
    const storedEmail = localStorage.getItem('email');
    const storedUserId = localStorage.getItem('user_id');

    if (storedToken) setToken(storedToken);
    if (storedRole) setRole(storedRole);
    if (storedUsername) setUsername(storedUsername);
    if (storedEmail) setEmail(storedEmail);
    if (storedUserId) setUserId(Number(storedUserId));
  }, []);

  const login = (token: string, role: Role, username: string, email: string, user_id: number) => {
    setToken(token);
    setRole(role);
    setUsername(username);
    setEmail(email);
    setUserId(user_id);

    localStorage.setItem('token', token);
    localStorage.setItem('role', role || '');
    localStorage.setItem('name', username);
    localStorage.setItem('email', email);
    localStorage.setItem('user_id', String(user_id));
  };

  const logout = () => {
    setToken(null);
    setRole(null);
    setUsername(null);
    setEmail(null);
    setUserId(null);

    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('name');
    localStorage.removeItem('email');
    localStorage.removeItem('user_id');
  };

  return (
    <AuthContext.Provider value={{ token, role, username, email, user_id, login, logout }}>
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