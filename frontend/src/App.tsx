import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Register from './component/RegisterForm';
import Login from './component/LoginForm';
import ProtectedRoute from './component/Protected';
import {AuthProvider} from './component/AuthContext'
import AdminRoleManager from './admin/Manageuser';
import CategoryProductsPage from './page/categoryproduct'
import HomePage from './page/Homepage';
import AddProductPage from './admin/Addproduct'
import CategoryManagementPage from './admin/Category'

const App: React.FC = () => {
  return (
    <AuthProvider>
    <Router>
      <Routes>
        {/* เส้นทางที่เปิดให้เข้าได้ */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/category/:categoryId" element={<CategoryProductsPage />} />
  
        {/* เส้นทางที่ต้องมีการล็อกอินและตรวจ role */}
        <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
          <Route path="/manageuser" element={<AdminRoleManager />} />
          <Route path="/addproductr" element={<AddProductPage />} />
          <Route path="/category" element={<CategoryManagementPage />} />
          <Route path="/manage-users" element={<div>Manage Users</div>} />
        </Route>
  
        <Route element={<ProtectedRoute allowedRoles={['USER']} />}>
          <Route path="/cart" element={<div>User Cart</div>} />
        </Route>
  
        {/* เส้นทางอื่น ๆ ที่ไม่เจอ */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  </AuthProvider>
  );
};

export default App;
