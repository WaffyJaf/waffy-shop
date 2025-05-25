import React, { useState } from 'react';
import { LoginData, User } from '../type/user';
import { loginUser } from '../api/authapi';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import { useAuth } from '../component/AuthContext';
import Swal from 'sweetalert2';

const Login: React.FC = () => {
  const [formData, setFormData] = useState<LoginData>({
    email: '',
    password: '',
  });

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  console.log('Login - Sending login data:', formData);
  try {
    const response = await loginUser(formData);
    console.log('Login - API response:', response);

    if (!response.token || !response.user || !response.user.user_id) {
      throw new Error('Invalid response data: Missing token or user_id');
    }

    const user: User = {
      user_id: response.user.user_id,
      email: response.user.email,
      name: response.user.name,
      role: response.user.role || 'USER',
    };
    console.log('Login - Constructed user:', user);

    login(response.token, user);
    console.log('Login - localStorage after login:', {
      token: localStorage.getItem('token'),
      user: JSON.parse(localStorage.getItem('user') || '{}'),
    });

    Swal.fire({
      icon: 'success',
      title: 'Login Successful',
      text: `Welcome back, ${response.user.name}!`,
      timer: 2000,
      showConfirmButton: false,
    }).then(() => {
      navigate('/');
    });
  } catch (err: any) {
    console.error('Login error:', err);
    const errorMessage = err.message || 'Invalid email or password.';
    Swal.fire({
      icon: 'error',
      title: 'Login Failed',
      text: errorMessage,
    });
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 to-sky-950 p-2">
      <Navbar />
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
        <div className="flex w-full max-w-3xl rounded-lg shadow-lg overflow-hidden">
          <div className="bg-white p-8 w-1/2 flex flex-col items-center">
            <div className="flex items-center justify-center mb-6">
              <h2 className="text-3xl font-bold text-gray-800">WAFFY SHOP</h2>
              <div className="ml-2">
                <i className="fa-solid fa-gamepad fa-2xl text-amber-300"></i>
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-6">เข้าสู่ระบบ</h3>
            <form onSubmit={handleSubmit} className="w-full space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">อีเมล</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="กรอกอีเมลของคุณ"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">รหัสผ่าน</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="กรอกรหัสผ่านของคุณ"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition duration-200"
              >
                เข้าสู่ระบบ
              </button>
            </form>
            <p className="mt-4 text-center text-sm text-gray-600">
              <Link to="/forgot-password" className="text-blue-600 hover:underline">
                ลืมรหัสผ่าน?
              </Link>
            </p>
            <p className="mt-2 text-center text-sm text-gray-600">
              ยังไม่มีบัญชี?{' '}
              <Link to="/register" className="text-blue-600 hover:underline">
                สมัครสมาชิก
              </Link>
            </p>
          </div>
          <div className="bg-blue-800 bg-opacity-50 p-8 w-1/2 flex flex-col items-center justify-center">
            <img src="/logo_waffy.png" alt="Waffy Shop Logo" className="h-48 mb-4" />
            <p className="text-white text-center">ร้านขายไอดีเกมออนไลน์</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;