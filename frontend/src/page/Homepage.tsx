import React from 'react';
import Swal from 'sweetalert2';
import Navbar from '../component/Navbar';

const HomePage: React.FC = () => {
  const handleLogout = () => {
    localStorage.removeItem('token');
    Swal.fire({
      icon: 'success',
      title: 'ออกจากระบบสำเร็จ',
      showConfirmButton: false,
      timer: 1500,
    }).then(() => {
      window.location.href = '/';
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-gray-950 to-sky-950 text-white">
      <Navbar />
      
      <div className="flex flex-col items-center justify-center text-center py-20 px-4">
        <h1 className="text-5xl font-bold mb-4">WELCOME TO WAFFY SHOP</h1>
        <h2 className="text-2xl mb-6 tracking-wide">สินค้ามาแรง</h2>
        <p className="max-w-xl mb-8 text-lg text-gray-300">
          นำขยะมาแยกทิ้งอย่างถูกวิธี และรับคะแนนสะสมไปแลกของรางวัลได้ที่ระบบของเรา
        </p>

        <button
          onClick={handleLogout}
          className="px-8 py-3 bg-white text-gray-900 text-lg font-semibold rounded-md hover:bg-gray-100 transition"
        >
          GET STARTED
        </button>

        {/* Placeholder for machine image */}
        <div className="mt-12 w-64 h-96 bg-gray-300 rounded-xl shadow-lg"></div>
        
      </div>
    </div>
  );
};

export default HomePage;