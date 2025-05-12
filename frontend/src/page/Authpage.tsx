import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '../component/LoginForm';
import RegisterForm from '../component/RegisterForm';

const AuthPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const navigate = useNavigate();
  
  // ตรวจสอบว่ามีการล็อกอินอยู่แล้วหรือไม่
  useEffect(() => {
    if (localStorage.getItem('token')) {
      navigate('/home');
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">การยืนยันตัวตนผู้ใช้</h1>
      
      <div className="bg-white rounded-lg shadow-md w-full max-w-md overflow-hidden">
        {/* Tab Selector */}
        <div className="flex text-lg border-b">
          <button
            className={`flex-1 py-3 font-medium transition-colors ${
              activeTab === 'login' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
            }`}
            onClick={() => setActiveTab('login')}
          >
            เข้าสู่ระบบ
          </button>
          <button
            className={`flex-1 py-3 font-medium transition-colors ${
              activeTab === 'register' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
            }`}
            onClick={() => setActiveTab('register')}
          >
            สมัครสมาชิก
          </button>
        </div>

        {/* Form Container */}
        <div className="p-6">
          {activeTab === 'login' ? <LoginForm /> : <RegisterForm />}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;