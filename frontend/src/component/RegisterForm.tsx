import React, { useState } from 'react';
import { RegisterData } from '../type/user';
import { registerUser } from '../api/authapi';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import Navbar from './Navbar';
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
      const response = await registerUser(formData);
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
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 to-sky-950 p-4">
      {/* Navbar อยู่ด้านบน */}
      <Navbar />

      <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
        <div className="flex w-full max-w-3xl rounded-lg shadow-lg overflow-hidden mt-4">
          {/* ฝั่งซ้าย: ฟอร์มลงทะเบียน */}
          <div className="bg-white p-8 w-1/2 flex flex-col items-center">
            {/* โลโก้ Waffy Shop */}
            <div className="flex items-center justify-center mb-6">
              <h2 className="text-3xl font-bold text-gray-800">WAFFY SHOP</h2>
              <div className="ml-2">
                <i className="fa-solid fa-gamepad fa-2xl text-amber-300"></i>
              </div>
            </div>

            {/* ข้อความ "สมัครสมาชิก" */}
            <h3 className="text-xl font-semibold text-gray-700 mb-6">สมัครสมาชิก</h3>

            <form onSubmit={handleSubmit} className="w-full space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">ชื่อผู้ใช้</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="กรอกชื่อผู้ใช้ของคุณ"
                />
              </div>
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
                สมัครสมาชิก
              </button>
            </form>
            <p className="mt-4 text-center text-sm text-gray-600">
              มีบัญชีอยู่แล้ว?{' '}
              <Link to="/login" className="text-blue-600 hover:underline">
                เข้าสู่ระบบ
              </Link>
            </p>
          </div>

          {/* ฝั่งขวา: ส่วนตกแต่ง */}
          <div className="bg-blue-800 bg-opacity-50 p-8 w-1/2 flex flex-col items-center justify-center">
            <img src="/logo_waffy.png" alt="Waffy Shop Logo" className="h-48 mb-4" />
            <p className="text-white text-center">ร้านขายไอดีเกมออนไลน์</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;