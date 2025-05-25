import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import Navbar from '../component/Navbar';
import { getProducts } from '../api/productapi';
import { addProductToCart } from '../api/orderapi';
import { FormProduct } from '../type/product';
import { useAuth, User } from '../component/AuthContext';

const AllProductsPage: React.FC = () => {
  const [products, setProducts] = useState<FormProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<FormProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('name-asc');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const navigate = useNavigate();
  const { user } = useAuth();

  
  const categories = ['all', 'electronics', 'clothing', 'accessories', 'home'];

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const data = await getProducts();
        const formattedProducts = data.map((product) => ({
          ...product,
          price: Number(product.price),
        }));
        const activeProducts = formattedProducts.filter(
          (product) => product.is_active && !isNaN(product.price)
        );
        setProducts(activeProducts);
        setFilteredProducts(activeProducts);
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: error instanceof Error ? error.message : 'ไม่สามารถดึงข้อมูลสินค้าได้',
          confirmButtonText: 'ตกลง',
          confirmButtonColor: '#9333ea',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Handle search and filtering
  useEffect(() => {
    let result = [...products];

    // Filter by search query
    if (searchQuery) {
      result = result.filter((product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort products
    result.sort((a, b) => {
      switch (sortOption) {
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'stock-asc':
          return a.stock - b.stock;
        case 'stock-desc':
          return b.stock - a.stock;
        default:
          return 0;
      }
    });

    setFilteredProducts(result);
  }, [searchQuery, sortOption, selectedCategory, products]);

  const addToCart = async (user: User | null, product: FormProduct) => {
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
        confirmButtonColor: '#9333ea',
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

  const handleProductClick = (id: number) => {
    if (!id) {
      Swal.fire({
        icon: 'error',
        title: 'ข้อผิดพลาด',
        text: 'ไม่สามารถเข้าถึงรายละเอียดสินค้าได้ เนื่องจาก ID ไม่ถูกต้อง',
        confirmButtonText: 'ตกลง',
        confirmButtonColor: '#9333ea',
      });
      return;
    }
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
    navigate(`/product/${id}`);
  };

  return (
     <div className="min-h-screen bg-gradient-to-r from-gray-950 to-sky-900 text-white">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">สินค้าทั้งหมด</h1>
          <div className="flex gap-4 mt-4 sm:mt-0">
            <div className="relative">
              <input
                type="text"
                placeholder="ค้นหาสินค้า..."
                className="pl-10 pr-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-sky-600"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
            </div>
            <select
              className="px-4 py-2 rounded bg-green-600 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-sky-600"
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
            >
              <option value="name-asc">ชื่อ: A-Z</option>
              <option value="name-desc">ชื่อ: Z-A</option>
              <option value="price-asc">ราคา: ต่ำ-สูง</option>
              <option value="price-desc">ราคา: สูง-ต่ำ</option>
              <option value="stock-asc">สต็อก: น้อย-มาก</option>
              <option value="stock-desc">สต็อก: มาก-น้อย</option>
            </select>
            <select
              className="px-4 py-2 rounded-lg bg-sky-700 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-sk\"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category === 'all' ? 'ทุกหมวดหมู่' : category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
            <span className="ml-3 text-lg">กำลังโหลดสินค้า...</span>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id_products}
                className="bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-purple-500/50 transition-all duration-300 cursor-pointer group"
                onClick={() => handleProductClick(product.id_products)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleProductClick(product.id_products);
                  }
                }}
                role="button"
                tabIndex={0}
                aria-label={`View ${product.name} details`}
              >
                <div className="relative w-full h-48 bg-gray-700">
                  <img
                    src={
                      product.image_url
                        ? `http://localhost:3000${product.image_url}`
                        : '/logo_waffy.png'
                    }
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => (e.currentTarget.src = '/logo_waffy.png')}
                    loading="lazy"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToCart(product);
                    }}
                    className="absolute top-3 right-3 bg-purple-600 p-2 rounded-full hover:bg-purple-700 transition-opacity opacity-0 group-hover:opacity-100"
                    aria-label={`Add ${product.name} to cart`}
                    disabled={product.stock === 0}
                  >
                    <i className="fa-solid fa-cart-plus text-white"></i>
                  </button>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold truncate text-white">{product.name}</h3>
                  <p className="text-green-500 font-bold mt-2">
                    ฿{isNaN(product.price) ? '0.00' : product.price.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    สต็อก: {product.stock > 0 ? product.stock : 'หมดสต็อก'}
                  </p>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleProductClick(product.id_products);
                    }}
                    className="mt-4 w-full bg-sky-700 text-white py-2 rounded-lg hover:bg-sky-900 transition"
                  >
                    ดูรายละเอียด
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-lg text-gray-400">ไม่มีสินค้าที่ตรงกับการค้นหา</p>
        )}
        <div className="flex justify-center mt-12">
          <Link
            to="/"
            className="px-8 py-3 bg-sky-700 text-white text-lg font-semibold rounded-lg hover:bg-sky-900 transition"
          >
            กลับสู่หน้าหลัก
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AllProductsPage;