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
import ManageProduct from './admin/Manageproduct';
import EditProduct from './admin/Editproduct';
import OrdersPage from './page/order';
import Productdetail from './page/productdetail';
import TopupForm from './page/topuppage';
import Cart from './page/cart';
import AllProductsPage from './page/allproduct';

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
        <Route path="/product/:id" element={< Productdetail  />} />
        <Route path="/topup" element={< TopupForm />} />
         <Route path="/product" element={< AllProductsPage />} />
  
        {/* เส้นทางที่ต้องมีการล็อกอินและตรวจ role */}
        <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
          <Route path="/manageuser" element={<AdminRoleManager />} />
          <Route path="/addproduct" element={<AddProductPage />} />
          <Route path="/category" element={<CategoryManagementPage />} />
          <Route path="/manageproduct" element={<ManageProduct />} />
          <Route path="/edit/:id" element={<EditProduct />} />
          <Route path="/manage-users" element={<div>Manage Users</div>} />
        </Route>
  
        <Route element={<ProtectedRoute allowedRoles={['USER']} />}>
          <Route path="/cart" element={<Cart />} />
          <Route path="/order" element={<OrdersPage />} />
        </Route>
  
        {/* เส้นทางอื่น ๆ ที่ไม่เจอ */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  </AuthProvider>
  );
};

export default App;
