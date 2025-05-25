import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useAuth } from '../component/AuthContext';

const Navbar: React.FC = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const { token, user, logout } = useAuth(); 
  const navigate = useNavigate();

  const handleUserClick = () => {
    if (!token) {
      navigate('/login');
    } else {
      setIsDropdownOpen((prev) => !prev);
    }
  };

  const handleDropdownClose = () => {
    setIsDropdownOpen(false);
    setIsUserDropdownOpen(false);
  };

  const handleLogout = () => {
    logout();
    handleDropdownClose();
    Swal.fire({
      icon: 'success',
      title: 'Logged Out',
      text: 'You have been logged out successfully.',
      timer: 1500,
      showConfirmButton: false,
    }).then(() => {
      navigate('/');
    });
  };

  return (
    <nav className="bg-transparent">
      <div className="max-w-8xl mx-auto flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center ">
          <Link to="/" className="flex ">
            <img src="/logo_waffy.png" className="h-25 w-40" alt="Waffy Logo" />
            <span className="mt-10 text-2xl font-bold text-white ">WAFFY GAME SHOP</span>
          </Link>
        </div>

        {/* Menu */}
        <div className="flex items-center space-x-2 mr-5">
          {/* Menu for all users */}
          <Link
            to="/"
            className="text-white hover:text-gray-300 text-sm font-medium uppercase tracking-wider py-3 px-3"
          >
            หน้าแรก
          </Link>

          <span className="text-white text-sm">|</span>

          <Link
            to="/product"
            className="text-white hover:text-gray-300 text-sm font-medium uppercase tracking-wider py-3 px-3"
          >
            สินค้าทั้งหมด
          </Link>
          <span className="text-white text-sm">|</span>
          <Link
            to="/shop"
            className="text-white hover:text-gray-300 text-sm font-medium uppercase tracking-wider py-3 px-3"
          >
            ติดต่อเรา
          </Link>

          {/* User-specific menu */}
          {user?.role === 'USER' && (
            <>
              <span className="text-white text-sm">|</span>
              <Link
                to="/topup"
                className="text-white hover:text-gray-300 text-sm font-medium uppercase tracking-wider py-3 px-3"
              >
                เติมเงิน
              </Link>

              <span className="text-white text-sm">|</span>
              <Link
                to="/cart"
                className="text-white hover:text-gray-300 text-sm font-medium uppercase tracking-wider py-3 px-3"
              >
                <i className="fa-solid fa-cart-plus text-xl"></i>
              </Link>
            </>
          )}

          {/* Admin-specific menu */}
          {user?.role === 'ADMIN' && (
            <>
            <span className="text-white text-sm">|</span>
              <Link
                to="/category"
                className="text-white hover:text-gray-300 text-sm font-medium uppercase tracking-wider py-3 px-3"
              >
                จัดการหมวดหมู่
              </Link>
              <span className="text-white text-sm">|</span>
              <Link
                to="/manageproduct"
                className="text-white hover:text-gray-300 text-sm font-medium uppercase tracking-wider py-3 px-3"
              >
                จัดการสินค้า
              </Link>

              <span className="text-white text-sm">|</span>

              {/* จัดการระบบ */}
              <div className="relative">
                <button
                  onClick={() => {
                    setIsUserDropdownOpen((prev) => !prev);
                  }}
                  className="text-white hover:text-gray-300 text-sm font-medium uppercase tracking-wider py-3 px-3 flex items-center"
                >
                  จัดการระบบ
                  <i className="fa-solid fa-caret-down ml-2"></i>
                </button>
                {isUserDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                    <div className="py-1">
                      <Link
                        to="/manageuser"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-800"
                        onClick={handleDropdownClose}
                      >
                        จัดการผู้ใช้งาน
                      </Link>
                      <Link
                        to="/manage-user" // Note: Check if this should be "/announcements"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-800"
                        onClick={handleDropdownClose}
                      >
                        ประกาศข่าวสาร
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Divider before Login/User */}
          

          {/* User/Login Button */}
          {!token ? (
            <Link
              to="/login"
              className="text-white border border-white hover:bg-white hover:text-gray-900 py-2 px-4 rounded-full text-sm font-medium uppercase tracking-wider"
            >
              Login
            </Link>
          ) : (
            <div className="relative">
              <button
                onClick={handleUserClick}
                className="text-white hover:text-gray-300 text-sm font-medium uppercase tracking-wider py-3 px-3 flex items-center"
              >
                <i className="fa-solid fa-circle-user text-xl mr-2"></i>
                {user?.name || 'User'}
              </button>
              {isDropdownOpen && token && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg z-10">
                  <div className="py-1">
                    <div className="px-4 py-2 text-sm text-gray-700">
                      <p className="font-medium">Username: {user?.name || 'User'}</p>
                      <p>Email: {user?.email || 'N/A'}</p>
                      <p>Role: {user?.role || 'N/A'}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="w-[97%] mx-auto border-b-2 border-white my-2"></div>
    </nav>
  );
};

export default Navbar;