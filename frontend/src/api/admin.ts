import axios from 'axios';
import { AuthResponse , UserRole,User } from '../type/user';


export const updateUserRole = async (userId: number, role: UserRole): Promise<AuthResponse> => {
  try {
    const response = await axios.post("http://localhost:3000/admin/updaterole", {
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
    const response = await axios.get("http://localhost:3000/admin/userdata");
    return response.data;
  } catch (error) {
    console.error('Get users API error:', error);
    throw new Error('Failed to fetch users');
  }
};

export const deleteUser = async (user_id: number) => {
  try {
    const response = await axios.delete(`http://localhost:3000/admin/deleteuser/${user_id}`);
    return response.data;
  } catch (error) {
    throw new Error('ไม่สามารถลบผู้ใช้ได้');
  }
};