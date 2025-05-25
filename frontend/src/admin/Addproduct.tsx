import { useState, useEffect, useRef } from 'react';
import { AddProducts, uploadImage } from '../api/productapi.ts';
import { FormProduct } from '../type/product.ts';
import Swal from 'sweetalert2';
import { useForm, SubmitHandler } from 'react-hook-form';
import { getAllCategories, Category } from '../api/categoryapi.ts';
import Navbar from '../component/Navbar.tsx';

const AddProductPage: React.FC = () => {
  const { 
    register, 
    handleSubmit, 
    formState: { errors, isSubmitting }, 
    reset,
  } = useForm<FormProduct>({
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      stock: 0,
      image_url: '',
      category_id: 0
    }
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileToUpload = useRef<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        console.log('Loading categories...');
        const data = await getAllCategories();
        console.log('Categories loaded:', data);
        setCategories(data);
      } catch (error) {
        console.error('Error loading categories:', error);
        setCategories([]);
      }
    };
    loadCategories();
  }, []);

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        Swal.fire({
          icon: 'error',
          title: 'ไฟล์ไม่ถูกต้อง',
          text: 'กรุณาอัพโหลดไฟล์รูปภาพเท่านั้น',
          confirmButtonText: 'ตกลง',
          confirmButtonColor: '#9333ea',
        });
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        Swal.fire({
          icon: 'error',
          title: 'ไฟล์ใหญ่เกินไป',
          text: 'ขนาดไฟล์ต้องไม่เกิน 5MB',
          confirmButtonText: 'ตกลง',
          confirmButtonColor: '#9333ea',
        });
        return;
      }
      const objectUrl = URL.createObjectURL(file);
      setImagePreview(objectUrl);
      fileToUpload.current = file;
    }
  };

  const handleUploadButtonClick = () => {
    fileInputRef.current?.click();
  };

  const onSubmit: SubmitHandler<FormProduct> = async (data) => {
  console.log('onSubmit started with data:', data);

  if (!fileToUpload.current && !data.image_url) {
    await Swal.fire({
      icon: 'error',
      title: 'กรุณาอัพโหลดรูปภาพ',
      text: 'คุณต้องอัพโหลดรูปภาพสินค้า',
      confirmButtonText: 'ตกลง',
      confirmButtonColor: '#9333ea',
    });
    return;
  }

  try {
    Swal.fire({
      title: 'กำลังดำเนินการ',
      text: 'กรุณารอสักครู่...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    let imageUrl = data.image_url;

    if (fileToUpload.current) {
      const uploadedUrl = await uploadImage(fileToUpload.current);
      if (!uploadedUrl) {
        throw new Error('ไม่สามารถอัปโหลดรูปภาพได้ กรุณาลองใหม่');
      }
      imageUrl = uploadedUrl;
      data.image_url = imageUrl;
    }

    const result = await AddProducts(data);

    Swal.close(); // ปิด Swal loading ก่อนแสดง success

    if (result.success) {
      await Swal.fire({
        icon: 'success',
        title: 'สำเร็จ!',
        text: result.message || 'เพิ่มสินค้าเรียบร้อยแล้ว! 🎉',
        confirmButtonText: 'ตกลง',
        confirmButtonColor: '#9333ea',
      });

      reset({
        name: '',
        description: '',
        price: 0,
        stock: 0,
        image_url: '',
        category_id: 0,
      });
      setImagePreview(null);
      fileToUpload.current = null;
      if (fileInputRef.current) fileInputRef.current.value = '';
    } else {
      throw new Error(result.message || 'เกิดข้อผิดพลาดในการเพิ่มสินค้า');
    }
  } catch (error) {
    Swal.close();
    let errorMessage = 'เกิดข้อผิดพลาดในการเพิ่มสินค้า กรุณาลองใหม่';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    await Swal.fire({
      icon: 'error',
      title: 'เกิดข้อผิดพลาด',
      text: errorMessage + ' ❌',
      confirmButtonText: 'ตกลง',
      confirmButtonColor: '#9333ea',
    });
  }
};


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900  to-sky-900">
      <Navbar />
      <div className="max-w-5xl mx-auto mt-12 p-8 bg-white rounded-2xl shadow-xl">
        <span className="text-4xl font-bold  text-center text-gray-900 tracking-tight">
          เพิ่มสินค้าใหม่
          <i className="fa-solid fa-plus ml-3 text-amber-400"></i>
        </span>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 mt-6">
          {/* Section: Basic Info */}
          <div className="bg-gray-100 p-6 rounded-xl shadow-sm">
            <span className="text-xl font-semibold mb-4 text-gray-800">ข้อมูลพื้นฐาน</span>
            <div className="grid grid-cols-1 gap-6">
              {/* Product Name */}
              <div>
                <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-700">
                  ชื่อสินค้า <span className="text-red-500">*</span>
                </label>
                <input
                  id="name"
                  {...register('name', { required: 'กรุณากรอกชื่อสินค้า' })}
                  className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow ${
                    errors.name ? 'border-red-500 shadow-sm' : 'hover:shadow-md'
                  }`}
                  placeholder="กรอกชื่อสินค้า"
                  aria-describedby={errors.name ? 'name-error' : undefined}
                />
                {errors.name && (
                  <p id="name-error" className="mt-1 text-red-500 text-sm">
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Product Description */}
              <div>
                <label htmlFor="description" className="block mb-2 text-sm font-medium text-gray-700">
                  รายละเอียดสินค้า
                </label>
                <textarea
                  id="description"
                  {...register('description')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow hover:shadow-md"
                  placeholder="กรอกรายละเอียดสินค้า"
                  rows={5}
                />
              </div>
            </div>
          </div>

          {/* Section: Pricing and Stock */}
          <div className="bg-gray-100 p-6 rounded-xl shadow-sm">
            <span className="text-xl font-semibold mb-4 text-gray-800">ราคาและสต็อก</span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Product Price */}
              <div>
                <label htmlFor="price" className="block mb-2 text-sm font-medium text-gray-700">
                  ราคา (บาท) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="price"
                  {...register('price', {
                    required: 'กรุณากรอกราคาสินค้า',
                    min: { value: 0.01, message: 'ราคาสินค้าต้องมากกว่า 0' },
                  })}
                  className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow ${
                    errors.price ? 'border-red-500 shadow-sm' : 'hover:shadow-md'
                  }`}
                  placeholder="0.00"
                  step="0.01"
                />
                {errors.price && (
                  <p className="mt-1 text-red-500 text-sm">{errors.price.message}</p>
                )}
              </div>

              {/* Product Stock */}
              <div>
                <label htmlFor="stock" className="block mb-2 text-sm font-medium text-gray-700">
                  จำนวนในคลัง <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="stock"
                  {...register('stock', {
                    required: 'กรุณากรอกจำนวนสินค้า',
                    min: { value: 0, message: 'จำนวนสินค้าต้องไม่ต่ำกว่า 0' },
                  })}
                  className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow ${
                    errors.stock ? 'border-red-500 shadow-sm' : 'hover:shadow-md'
                  }`}
                  placeholder="0"
                />
                {errors.stock && (
                  <p className="mt-1 text-red-500 text-sm">{errors.stock.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Section: Category and Image */}
          <div className="bg-gray-50 p-6 rounded-xl shadow-sm">
            <span className="text-xl font-semibold mb-4 text-gray-800">หมวดหมู่และรูปภาพ</span>
            <div className="grid grid-cols-1 gap-6">
              {/* Category */}
              <div>
                <label htmlFor="category_id" className="block mb-2 text-sm font-medium text-gray-700">
                  หมวดหมู่ <span className="text-red-500">*</span>
                </label>
                <select
                  id="category_id"
                  {...register('category_id', {
                    required: 'กรุณาเลือกหมวดหมู่',
                    validate: (value) => Number(value) > 0 || 'กรุณาเลือกหมวดหมู่',
                  })}
                  className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow ${
                    errors.category_id ? 'border-red-500 shadow-sm' : 'hover:shadow-md'
                  }`}
                >
                  <option value="">เลือกหมวดหมู่</option>
                  {Array.isArray(categories) && categories.length > 0 ? (
                    categories.map((category) => (
                      <option key={category.id_categories} value={category.id_categories}>
                        {category.name}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>
                      ไม่มีหมวดหมู่
                    </option>
                  )}
                </select>
                {errors.category_id && (
                  <p className="mt-1 text-red-500 text-sm">{errors.category_id.message}</p>
                )}
              </div>

              {/* Image Upload */}
              <div>
                <label htmlFor="image" className="block mb-2 text-sm font-medium text-gray-700">
                  รูปภาพสินค้า <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={handleUploadButtonClick}
                    className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  >
                    เลือกรูปภาพ
                  </button>
                  <input
                    type="file"
                    id="image"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <input type="hidden" {...register('image_url')} />
                </div>
                {imagePreview && (
                  <div className="mt-4 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
                    <p className="mb-2 text-sm font-medium text-gray-600">ตัวอย่างรูปภาพ:</p>
                    <img
                      src={imagePreview}
                      alt="Product preview"
                      className="h-48 w-full object-contain rounded-md"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-8 py-3 rounded-lg text-white font-medium transition-all duration-200 ${
                isSubmitting
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 shadow-md hover:shadow-lg'
              }`}
            >
              {isSubmitting ? 'กำลังดำเนินการ...' : 'เพิ่มสินค้า'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductPage;