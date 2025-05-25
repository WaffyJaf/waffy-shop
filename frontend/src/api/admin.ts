import axios from 'axios';
import { AuthResponse , UserRole,User } from '../type/user.ts';

const API_URL = import.meta.env.VITE_API_URL;

export const updateUserRole = async (userId: number, role: UserRole): Promise<AuthResponse> => {
  try {
    const response = await axios.post(`${API_URL}/admin/updaterole`, {
      userId,
      role,
    });
    return response.data.user; 
  } catch (error) {
    console.error('Update role API error:', error);
    throw new Error('Failed to update role');
  }
};

export const getUsers = async (): Promise<User[]> => {
  try {
    const response = await axios.get(`${API_URL}/admin/userdata`);
    return response.data;
  } catch (error) {
    console.error('Get users API error:', error);
    throw new Error('Failed to fetch users');
  }
};

export const deleteUser = async (user_id: number) => {
  try {
    const response = await axios.delete(`${API_URL}/admin/deleteuser/${user_id}`);
    return response.data;
  } catch (error) {
    throw new Error('ไม่สามารถลบผู้ใช้ได้');
  }
};