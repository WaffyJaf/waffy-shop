import axios from 'axios';
import { RegisterData, LoginData, AuthResponse } from '../type/user';

export const registerUser = async (data: RegisterData): Promise<AuthResponse> => {
  try {
    console.log('Register request data:', data);
    const response = await axios.post('http://localhost:3000/auth/register', data, {
      withCredentials: true,
    });
    console.log('Register response:', response.data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Register error:', error.response?.data);
      throw new Error(error.response?.data?.error || 'Registration failed');
    }
    throw new Error('Registration failed');
  }
};

export const loginUser = async (data: LoginData): Promise<AuthResponse> => {
  try {
    console.log('Login request data:', data);
    const response = await axios.post('http://localhost:3000/auth/login', data, {
      withCredentials: true,
    });
    console.log('Login response:', response.data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Login error:', error.response?.data);
      throw new Error(error.response?.data?.error || 'Login failed');
    }
    throw new Error('Login failed');
  }
};