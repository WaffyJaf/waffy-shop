import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import Navbar from '../component/Navbar';
import { getAllCategories, Category } from '../api/categoryapi';

const categoryImages: { [key: number]: string } = {
  1: '/steam.jpg',
  2: '/rov.webp',
  3: '/freefire.jpg',
  4: '/roblox.jpg',
};

const bannerImages = ['/rov.webp', '/steam.jpg', '/roblox.jpg'];

const HomePage: React.FC = () => {
  const bannerRef = useRef<HTMLDivElement>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentBanner, setCurrentBanner] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (bannerRef.current) {
        const nextIndex = (currentBanner + 1) % bannerImages.length;
        const scrollAmount = nextIndex * bannerRef.current.offsetWidth;
        bannerRef.current.scrollTo({ left: scrollAmount, behavior: 'smooth' });
        setCurrentBanner(nextIndex);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [currentBanner]);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const data = await getAllCategories();
      setCategories(data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: 'ไม่สามารถดึงข้อมูลหมวดหมู่ได้',
        confirmButtonText: 'ลองใหม่',
        confirmButtonColor: '#9333ea',
      }).then((result) => {
        if (result.isConfirmed) {
          fetchCategories();
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  const scrollBanner = (direction: 'left' | 'right') => {
    if (bannerRef.current) {
      const width = bannerRef.current.offsetWidth;
      const scrollAmount = direction === 'left' ? -width : width;
      bannerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      const newIndex =
        direction === 'left'
          ? (currentBanner - 1 + bannerImages.length) % bannerImages.length
          : (currentBanner + 1) % bannerImages.length;
      setCurrentBanner(newIndex);
    }
  };

  const handleViewCategories = () => {
    console.log('Navigating to /categories');
    navigate('/categories');
  };

  const handleCategoryClick = (categoryId: number) => {
    console.log(`Navigating to /category/${categoryId}`);
    navigate(`/category/${categoryId}`);
  };

  const memoizedCategories = useMemo(() => categories, [categories]);

  return (
    <div className="min-h-screen bg-gradient-to-r from-gray-950 to-sky-950 text-white">
      <Navbar />

      {/* Advertisement Banner Carousel */}
      <div className="relative w-[90%] max-w-[1100px] mx-auto overflow-hidden bg-gray-900 py-2 rounded-xl">
        <button
          onClick={() => scrollBanner('left')}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white bg-opacity-50 hover:bg-opacity-100 p-4 rounded-full transition"
          aria-label="เลื่อนป้ายโฆษณาซ้าย"
          aria-controls="banner-carousel"
        >
          ←
        </button>
        <button
          onClick={() => scrollBanner('right')}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white bg-opacity-50 hover:bg-opacity-100 p-4 rounded-full transition"
          aria-label="เลื่อนป้ายโฆษณาขวา"
          aria-controls="banner-carousel"
        >
          →
        </button>
        <div
          ref={bannerRef}
          id="banner-carousel"
          className="flex overflow-hidden scroll-smooth snap-x snap-mandatory w-full"
        >
          {bannerImages.length > 0 ? (
            bannerImages.map((src, idx) => (
              <img
                key={idx}
                src={src}
                alt={`Banner ${idx + 1}`}
                className="snap-center w-full h-[300px] object-cover rounded-xl flex-shrink-0"
                onError={(e) => (e.currentTarget.src = '/logo_waffy.png')}
                loading="lazy"
              />
            ))
          ) : (
            <p className="text-center w-full">ไม่มีป้ายโฆษณา</p>
          )}
        </div>
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
          {bannerImages.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                if (bannerRef.current) {
                  bannerRef.current.scrollTo({
                    left: idx * bannerRef.current.offsetWidth,
                    behavior: 'smooth',
                  });
                  setCurrentBanner(idx);
                }
              }}
              className={`w-3 h-3 rounded-full ${
                idx === currentBanner ? 'bg-white' : 'bg-gray-400'
              }`}
              aria-label={`Go to banner ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col items-center text-center py-12 px-4">
        <span className="text-4xl font-bold mb-4">WELCOME TO WAFFY SHOP</span>
        <span className="text-2xl mb-9 tracking-wide">หมวดหมู่สินค้ามาแรง</span>

        <button
          onClick={handleViewCategories}
          className="px-8 py-3 bg-white text-gray-900 text-lg font-semibold rounded-lg hover:bg-gray-200 transition animate-pulse"
        >
          ดูหมวดหมู่เพิ่มเติม
          <i className="fa-solid fa-crown fa-xl ml-3"></i>
        </button>

        {/* Horizontal Category Section */}
        <div className="mt-12 flex flex-row space-x-6 overflow-x-auto w-full px-4 justify-center scrollbar-hide">
          {isLoading ? (
            <p className="text-lg">กำลังโหลดหมวดหมู่...</p>
          ) : memoizedCategories.length > 0 ? (
            memoizedCategories.map((category) => (
              <div
                key={category.id_categories}
                className="bg-white text-gray-900 rounded-lg overflow-hidden shadow-lg hover:scale-105 transition-transform cursor-pointer flex-shrink-0 w-72"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCategoryClick(category.id_categories);
                }}
                aria-label={`View ${category.name} category`}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleCategoryClick(category.id_categories);
                  }
                }}
              >
                <div className="relative w-full h-48 bg-gray-200 ">
                  <img
                    src={categoryImages[category.id_categories] || '/logo_waffy.png'}
                    alt={category.name}
                    className="w-full h-full object-cover pointer-events-none"
                    onError={(e) => (e.currentTarget.src = '/logo_waffy.png')}
                    loading="lazy"
                  />
                </div>
                <div className="p-4 text-center text-lg font-semibold">
                  {category.name}
                </div>
              </div>
            ))
          ) : (
            <p className="text-lg">ไม่มีหมวดหมู่</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;