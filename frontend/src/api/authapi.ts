import axios from 'axios';
import { RegisterData, LoginData, AuthResponse } from '../type/user';



export const registerUser = async (data: RegisterData): Promise<AuthResponse> => {
  try {
    const response = await axios.post("http://localhost:3000/auth/register", data, { withCredentials: true });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error; // ❗ Axios error กลับไปให้ frontend handle
    } else {
      throw new Error('Registration failed');
    }
  }
};
export const loginUser = async (data: LoginData): Promise<AuthResponse> => {
  try {
    const response = await axios.post("http://localhost:3000/auth/login", data,{ withCredentials: true });
    return response.data;
  } catch (error) {
    throw new Error('Login failed');
  }
};