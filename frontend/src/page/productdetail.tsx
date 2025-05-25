import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import Navbar from '../component/Navbar.tsx';
import { getProductById } from '../api/productapi.ts';
import { addProductToCart } from '../api/orderapi.ts';
import { FormProduct } from '../type/product.ts';
import { useAuth, User } from '../component/AuthContext.tsx';
import { Link } from 'react-router-dom';

const Productdetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [product, setProduct] = useState<FormProduct | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity] = useState<number>(1);
  const [isAddingToCart, setIsAddingToCart] = useState<boolean>(false);

  // ดึงข้อมูลสินค้าจาก API
  const fetchProduct = async (productId: number) => {
    try {
      setLoading(true);
      const data = await getProductById(productId);
      setProduct(data);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการดึงข้อมูลสินค้า';
      setError(errorMessage);
      console.error(err);
      
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: errorMessage,
        confirmButtonColor: '#d33',
      });
    } finally {
      setLoading(false);
    }
  };

  // เพิ่มสินค้าลงตะกร้า
  const addToCart = async (user: User, product: FormProduct, quantity: number) => {
    if (!user) {
      return;
    }

    try {
      setIsAddingToCart(true);
      await addProductToCart(user.user_id, product.id_products, quantity);
      Swal.fire({
        icon: 'success',
        title: 'เพิ่มลงตะกร้า',
        text: `${product.name} จำนวน ${quantity} ชิ้น ถูกเพิ่มลงในตะกร้าสินค้า`,
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: 'ไม่สามารถเพิ่มสินค้าในตะกร้าได้',
      });
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;

    if (!user) {
      Swal.fire({
        icon: 'warning',
        title: 'กรุณาเข้าสู่ระบบ',
        text: 'คุณต้องเข้าสู่ระบบเพื่อเพิ่มสินค้าลงในตะกร้า',
        confirmButtonText: 'เข้าสู่ระบบ',
        confirmButtonColor: '#9333ea',
      }).then(() => {
        navigate('/login');
      });
      return;
    }

    // ตรวจสอบจำนวนสินค้าในสต็อก
    if (quantity > product.stock) {
      Swal.fire({
        icon: 'warning',
        title: 'จำนวนสินค้าไม่เพียงพอ',
        text: `สินค้าในสต็อกเหลือเพียง ${product.stock} ชิ้น`,
        confirmButtonColor: '#f39c12',
      });
      return;
    }

    addToCart(user, product, quantity);
  };

  const handleCheckout = (productId: number) => {
    if (!user) {
      Swal.fire({
        icon: 'warning',
        title: 'กรุณาเข้าสู่ระบบ',
        text: 'คุณต้องเข้าสู่ระบบเพื่อดำเนินการซื้อ',
        confirmButtonText: 'เข้าสู่ระบบ',
        confirmButtonColor: '#9333ea',
      }).then(() => {
        navigate('/login');
      });
      return;
    }
    console.log(`Navigating to checkout: Product ID ${productId}`);
    navigate(`/checkout/${productId}`);
  };

  useEffect(() => {
    if (id) {
      const productId = parseInt(id);
      if (!isNaN(productId)) {
        fetchProduct(productId);
      } else {
        setError('ID สินค้าไม่ถูกต้อง');
        setLoading(false);
      }
    } else {
      setError('ไม่พบ ID สินค้า');
      setLoading(false);
    }
  }, [id]);

  // แสดง Loading
  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-lg text-gray-600">กำลังโหลดข้อมูลสินค้า...</span>
            </div>
          </div>
        </div>
      </>
    );
  }

  // แสดง Error
  if (error || !product) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="container mx-auto px-4">
            <div className="text-center py-16">
              <div className="text-6xl text-gray-400 mb-4">😞</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">ไม่พบสินค้า</h2>
              <p className="text-gray-600 mb-6">{error || 'ไม่พบสินค้าที่คุณค้นหา'}</p>
              <button
                onClick={() => navigate('/')}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition duration-200"
              >
                กลับไปหน้าหลัก
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-gray-950 to-sky-950 text-white">
      <Navbar />
      <div className="max-w-6xl mx-auto p-6">
        <div className="container mx-auto px-4">
          

          {/* Product Detail */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
              {/* Product Image */}
              <div className="space-y-4">
                <div className="aspect-square w-full bg-gray-100 rounded-lg overflow-hidden">
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
              </div>

              {/* Product Info */}
              <div className="space-y">
                <div>
                  <span className="text-3xl font-bold text-gray-900 mb-2">
                    {product.name}
                  </span>
                  
                  {/* Status Badge */}
                  <div className="flex items-center space-x-2 mb-4 mt-6">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xm font-medium ${
                        product.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {product.is_active ? 'พร้อมจำหน่าย' : 'ไม่พร้อมจำหน่าย'}
                    </span>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xm font-medium ${
                        product.stock > 0
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      คงเหลือ {product.stock} ชิ้น
                    </span>
                  </div>
                </div>

                {/* Price */}
                <div className="text-4xl font-bold text-blue-600">
                  ฿{product.price.toLocaleString()}
                </div>

                {/* Description */}
                <div>
                  <span className="text-lg font-semibold text-gray-900 mb-2">รายละเอียดสินค้า</span>
                  <p className="text-gray-700 leading-relaxed">
                    {product.description || 'ไม่มีรายละเอียดสินค้า'}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-4 mt-15">
                  {product.is_active && product.stock > 0 ? (
                    <>
                      <button
                        onClick={handleAddToCart}
                        disabled={isAddingToCart}
                        className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                      >
                        {isAddingToCart ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                            กำลังเพิ่มลงตะกร้า...
                          </>
                        ) : (
                          <>
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0h8.5" />
                            </svg>
                            เพิ่มลงตะกร้า
                          </>
                        )}
                      </button>
                      
                      <button
                        onClick={() => handleCheckout(product.id_products)}
                        className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition duration-200 flex items-center justify-center"
                      >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        ซื้อทันที
                      </button>
                    </>
                  ) : (
                    <button
                      disabled
                      className="flex-1 bg-gray-400 text-white py-3 px-6 rounded-lg font-semibold cursor-not-allowed"
                    >
                      {!product.is_active ? 'สินค้าไม่พร้อมจำหน่าย' : 'สินค้าหมด'}
                    </button>
                  )}
                  
                  <button
                    onClick={() => navigate(-1)}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition duration-200"
                  >
                    ย้อนกลับ
                  </button>
                </div>

                {/* Product Info */}
                <div className="border-t">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">ข้อมูลสินค้า</h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>รหัสสินค้า:</span>
                      <span className="font-medium">#{product.id_products}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>หมวดหมู่:</span>
                      <span className="font-medium">หมวดที่ {product.category_id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>สถานะ:</span>
                      <span className="font-medium">
                        {product.is_active ? 'เปิดขาย' : 'ปิดขาย'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Full-Width White Background for How to Order and How to Top Up Sections */}
          <div className="mt-12 bg-white">
            <div className="max-w-6xl mx-auto p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* How to Order Section */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex justify-between items-center mb-8">
                    <span className="text-3xl font-bold text-black flex items-center">
                      <i className="fa-solid fa-shop mr-3 text-amber-300"></i> วิธีการสั่งซื้อสินค้า
                    </span>
                  </div>
                  <ol className="list-decimal list-inside space-y-3 text-gray-700">
                    <li>เลือกสินค้าที่ถูกใจ</li>
                    <li>เข้าสู่ระบบหากยังไม่ได้ล็อกอิน</li>
                    <li>คลิกปุ่ม "เพิ่มลงตะกร้า" </li>
                    <li>ตรวจสอบตะกร้าสินค้าและสร้างคำสั่งซื้อ</li>
                    <li>ชำระเงินโดยระบบจะตัดจาก coin </li>
                    <li>รับสินค้าได้เลย เช็คได้ที่คำสั่งซื้อ</li>
                  </ol>
                </div>

                {/* How to Top Up Section */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex justify-between items-center mb-8">
                    <span className="text-3xl font-bold text-black flex items-center">
                      <i className="fa-solid fa-wallet mr-3 text-amber-300"></i> วิธีการเติมเงิน
                    </span>
                  </div>
                  <ol className="list-decimal list-inside space-y-3 text-gray-700">
                    <li>เข้าสู่ระบบบัญชีของคุณ</li>
                    <li>ไปที่หน้า "เติมเงิน" </li>
                    <li>กรอกจำนวนเงินที่ต้องการเติม</li>
                    <li>เลือกธนาคารของผู้ใช้</li>
                    <li>ยืนยันการทำรายการและรอการอัปเดตยอดเงิน coin</li>
                    <li>ใช้ยอดเงินในกระเป๋าเพื่อชำระค่าสินค้าในขั้นตอนการสั่งซื้อ</li>
                  </ol>
                  
                </div>
                
              </div>
            </div>
            {/* Contact Admin Warning */}
              <div className=" text-center p-3">
                <span className="text-red-500 text-xm flex items-center justify-center gap-2">
                  หากมีปัญหากรุณาติดต่อแอดมินภายใน 24 ชั่วโมง
                  <Link to="/contact" className="text-blue-600 hover:underline">
                    คลิกเพื่อติดต่อเรา
                  </Link>
                </span>
              </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Productdetail;