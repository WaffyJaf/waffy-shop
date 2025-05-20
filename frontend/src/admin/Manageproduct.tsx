import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getProducts, deleteProduct } from '../api/productapi';
import { FormProduct } from '../type/product';
import Navbar from '../component/Navbar';
import Swal from 'sweetalert2';

const ManageProduct: React.FC = () => {
  const [products, setProducts] = useState<FormProduct[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // ดึงข้อมูลสินค้าจาก API
  const fetchProducts = async () => {
    try {
      const data = await getProducts();
      setProducts(data);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการดึงข้อมูลสินค้า');
      setLoading(false);
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการดึงข้อมูลสินค้า',
        confirmButtonColor: '#d33',
      });
    }
  };

  // ลบสินค้า
  const handleDeleteProduct = async (id: number) => {
    const result = await Swal.fire({
      title: 'คุณแน่ใจหรือไม่?',
      text: 'การลบสินค้านี้จะไม่สามารถกู้คืนได้!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'ใช่, ลบเลย!',
      cancelButtonText: 'ยกเลิก',
    });

    if (result.isConfirmed) {
      try {
        await deleteProduct(id);
        setProducts(products.filter((product) => product.id_products !== id));
        Swal.fire({
          icon: 'success',
          title: 'ลบสินค้าสำเร็จ',
          showConfirmButton: false,
          timer: 1500,
        });
      } catch (err) {
        console.error('เกิดข้อผิดพลาดในการลบสินค้า:', err);
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการลบสินค้า',
          confirmButtonColor: '#d33',
        });
      }
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-red-600 bg-red-100 p-6 rounded-lg shadow-lg">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-sky-900">
      <Navbar />
      <div className="container mx-auto p-8">
        {/* หัวข้อหน้า */}
        <div className="flex justify-between items-center mb-8">
          <span className="text-4xl font-bold text-white flex items-center">
            <i className="fa-solid fa-box mr-3 text-amber-300"></i> จัดการสินค้า
          </span>
          
        </div>

        {/* ตารางสินค้า */}
        {products.length === 0 ? (
          <div className="text-center text-gray-600 bg-white p-10 rounded-lg shadow-md">
            <i className="fa-solid fa-exclamation-circle text-4xl text-gray-400 mb-4"></i>
            <p className="text-xl">ไม่พบสินค้า</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-yellow-400 text-gray-900 text-sm uppercase tracking-wider">
                    <th className="py-4 px-6 text-left">รหัสสินค้า</th>
                    <th className="py-4 px-6 text-left">รูปภาพ</th>
                    <th className="py-4 px-6 text-left">ชื่อสินค้า</th>
                    <th className="py-4 px-6 text-right">ราคา</th>
                    <th className="py-4 px-6 text-right ">สต็อก</th>
                    <th className="py-4 px-6 text-center">สถานะ</th>
                    <th className="py-4 px-6 text-center">การจัดการ</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700">
                  {products.map((product) => (
                    <tr
                      key={product.id_products}
                      className="border-b border-gray-200 hover:bg-gray-50 transition-all duration-200"
                    >
                      <td className="py-4 px-6 font-medium">{product.id_products}</td>
                      <td className="py-4 px-6">
                        <div className="w-16 h-16 bg-gray-200 rounded-md overflow-hidden">
                          <img
                            src={
                              product.image_url
                                ? `http://localhost:3000${product.image_url}`
                                : '/logo_waffy.png'
                            }
                            alt={product.name}
                            className="w-full h-full object-cover"
                            onError={(e) => (e.currentTarget.src = '/logo_waffy.png')}
                            loading="lazy"
                          />
                        </div>
                      </td>
                      <td className="py-4 px-6 font-medium text-blue-600">{product.name}</td>
                      <td className="py-4 px-6 text-right font-medium">
                        {product.price.toLocaleString('th-TH', {
                          style: 'currency',
                          currency: 'THB',
                        })}
                      </td>
                      <td className="py-4 px-6 text-right">{product.stock}</td>
                      <td className="py-4 px-6 text-center">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-medium shadow-sm ${
                            product.is_active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {product.is_active ? 'ใช้งาน' : 'ปิดใช้งาน'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center flex justify-center space-x-3">
                        <Link
                          to={`/edit/${product.id_products}`}
                          className="flex items-center bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-all duration-300 transform hover:scale-105"
                        >
                          <i className="fa-solid fa-edit mr-2"></i> แก้ไข
                        </Link>
                        <button
                          onClick={() => handleDeleteProduct(product.id_products)}
                          className="flex items-center bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-all duration-300 transform hover:scale-105"
                        >
                          <i className="fa-solid fa-trash mr-2"></i> ลบ
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageProduct;