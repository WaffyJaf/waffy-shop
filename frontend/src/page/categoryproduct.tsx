import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import Navbar from '../component/Navbar';
import { getProductsByCategory } from '../api/productapi';
import { addProductToCart } from '../api/orderapi';
import { FormProduct } from '../type/product';
import { getAllCategories, Category } from '../api/categoryapi';
import { useAuth, User } from '../component/AuthContext'; 

const CategoryProductsPage: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const [products, setProducts] = useState<FormProduct[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth(); 

  useEffect(() => {
    console.log('CategoryProductsPage loaded with categoryId:', categoryId);
    const fetchCategoryAndProducts = async () => {
      setIsLoading(true);
      try {
        console.log('Fetching categories...');
        const categories = await getAllCategories();
        console.log('Categories fetched:', categories);

        const selectedCategory = categories.find(
          (cat) => cat.id_categories === Number(categoryId)
        );
        if (!selectedCategory) {
          throw new Error('ไม่พบหมวดหมู่');
        }
        setCategory(selectedCategory);

        if (categoryId) {
          console.log('Fetching products for category:', categoryId);
          const data = await getProductsByCategory(Number(categoryId));
          console.log('Products fetched:', data);
          setProducts(data);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: error instanceof Error ? error.message : 'ไม่สามารถดึงข้อมูลสินค้าหรือหมวดหมู่ได้',
          confirmButtonText: 'ตกลง',
          confirmButtonColor: '#9333ea',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategoryAndProducts();
  }, [categoryId]);

  const addToCart = async (user: User, product: FormProduct) => {
    if (!user) {
    
    return;
  }
    try {
      await addProductToCart(user.user_id, product.id_products, 1);
      Swal.fire({
        icon: 'success',
        title: 'เพิ่มลงตะกร้า',
        text: `${product.name} ถูกเพิ่มลงในตะกร้าสินค้า`,
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: 'ไม่สามารถเพิ่มสินค้าในตะกร้าได้',
      });
    }
  };

  const handleAddToCart = (product: FormProduct) => {
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
    addToCart(user, product);
  };

  const buyNow = (productId: number) => {
    console.log(`Buy now: Product ID ${productId}`);
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
    navigate(`/checkout/${productId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-gray-950 to-sky-950 text-white">
      <Navbar />
      <div className="max-w-5xl mx-auto mt-12 p-6">
        <span className="text-3xl font-bold text-left">
          สินค้าในหมวดหมู่: {category ? category.name : 'กำลังโหลด...'}
        </span>
        {isLoading ? (
          <div className="text-center text-lg">กำลังโหลดสินค้า...</div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
            {products.map((product) => (
              <div
                key={product.id_products}
                className="bg-white text-gray-900 rounded-lg overflow-hidden shadow-lg hover:scale-105 transition-transform cursor-default"
                aria-label={`View ${product.name}`}
              >
                <div className="relative w-full h-48 bg-gray-200">
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
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToCart(product);
                    }}
                    className="absolute top-2 right-2 bg-white bg-opacity-80 p-2 rounded-full hover:bg-opacity-100 transition"
                    aria-label={`Add ${product.name} to cart`}
                  >
                    <i className="fa-solid fa-cart-plus text-gray-900"></i>
                  </button>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold truncate">{product.name}</h3>
                  <p className="text-gray-600 mt-1 line-clamp-2">{product.description}</p>
                  <p className="text-blue-600 font-bold mt-2">
                    ฿{product.price.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">สต็อก: {product.stock}</p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      buyNow(product.id_products);
                    }}
                    className="mt-3 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
                  >
                    ซื้อเลย
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-lg">ไม่มีสินค้าในหมวดหมู่นี้</p>
        )}
        <div className="flex justify-center mt-8">
          <Link
            to="/"
            className="hover:text-purple-400 text-gray-900 px-8 py-3 bg-white text-lg font-semibold rounded-lg hover:bg-gray-900 transition mt-10"
          >
            กลับสู่หน้าหลัก
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CategoryProductsPage;