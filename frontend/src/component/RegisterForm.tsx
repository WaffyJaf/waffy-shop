import React, { useState } from 'react';
import { RegisterData } from '../type/user'; 
import { registerUser } from '../api/authapi'; 
import { useNavigate } from 'react-router-dom'; 
import { Link } from 'react-router-dom';
import { useAuth } from '../component/AuthContext';
import axios from 'axios';
import Swal from 'sweetalert2'; 

const Register: React.FC = () => {
  const [formData, setFormData] = useState<RegisterData>({
    email: '',
    name: '',
    password: '',
  });

  const navigate = useNavigate(); 
  const { login } = useAuth(); 

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await registerUser(formData); // เรียก API สำหรับลงทะเบียน
      login(
        response.token,
        response.user.role || 'USER',
        response.user.name,
        response.user.email
      );

      Swal.fire({
        icon: 'success',
        title: 'Registration Successful',
        text: `ยินดีต้อนรับ, ${response.user.name}!`,
        timer: 2000,
        showConfirmButton: false,
      }).then(() => {
        navigate('/login'); 
      });
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response?.data?.error === 'Email already exists') {
          Swal.fire({
            icon: 'error',
            title: 'Registration Failed',
            text: 'อีเมลนี้ได้รับการลงทะเบียนไปแล้ว',
          });
        } else if (err.response?.data?.error === 'Username already exists') {
          Swal.fire({
            icon: 'error',
            title: 'Registration Failed',
            text: 'ชื่อผู้ใช้นี้ถูกใช้ไปแล้ว',
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Registration Failed',
            text: 'Something went wrong. Please try again.',
          });
        }
      } else {
        console.error(err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'An unexpected error occurred.',
        });
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Register
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your username"
            />
          </div>
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
            Register
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
