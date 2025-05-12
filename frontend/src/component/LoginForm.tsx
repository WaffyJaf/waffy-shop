import React, { useState } from 'react';
import { LoginData } from '../type/user'; 
import { loginUser } from '../api/authapi'; 
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom'; 
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
    console.log("Sending login data:", formData);
    try {
      const response = await loginUser(formData);
      console.log('Response:', response);

      // ตรวจสอบว่า response มีทั้ง token และ user หรือไม่
      if (!response.token || !response.user) {
        throw new Error('Invalid response data');
      }

      // 👇 ใช้ login จาก context (จะเก็บใน localStorage และอัปเดต global auth state)
    login(
      response.token,
      response.user.role || 'USER',
      response.user.name,
      response.user.email
    );

      
      Swal.fire({
        icon: 'success',
        title: 'Login Successful',
        text: `Welcome back, ${response.user.name}!`,
        timer: 2000,
        showConfirmButton: false,
      }).then(() => {
        if (response.user.role === 'ADMIN') {
          navigate('/');
        } else {
          navigate('/');
        }
      });
    } catch (err: any) {
      console.error('Login error:', err);  
      // ตรวจสอบ error ที่เกิดขึ้นจากการตอบกลับ API
      const errorMessage = err.response?.data?.error || 'Invalid email or password.';
      Swal.fire({
        icon: 'error',
        title: 'Login Failed',
        text: errorMessage, 
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Login
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your email"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your password"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition duration-200"
          >
            Login
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <Link to="/register" className="text-blue-600 hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
