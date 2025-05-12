import React, { useState, useEffect, useRef } from 'react';
import { AddProducts, uploadImage } from '../api/productapi';
import { FormProduct } from '../type/product.ts';
import Swal from 'sweetalert2';
import { useForm, SubmitHandler } from 'react-hook-form';
import { getAllCategories, Category } from '../api/categoryapi.ts';

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
    <div className="container mx-auto p-4">
      <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-center">เพิ่มสินค้าใหม่</h1>
        
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Product Name */}
          <div className="mb-4">
            <label htmlFor="name" className="block mb-2 font-medium">
              ชื่อสินค้า <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              {...register("name", { required: "กรุณากรอกชื่อสินค้า" })}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.name ? "border-red-500" : ""
              }`}
              placeholder="กรอกชื่อสินค้า"
              aria-describedby={errors.name ? "name-error" : undefined}
            />
            {errors.name && (
              <p id="name-error" className="mt-1 text-red-500 text-sm">{errors.name.message}</p>
            )}
          </div>

          {/* Product Description */}
          <div className="mb-4">
            <label htmlFor="description" className="block mb-2 font-medium">
              รายละเอียดสินค้า
            </label>
            <textarea
              id="description"
              {...register("description")}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="กรอกรายละเอียดสินค้า"
              rows={4}
            />
          </div>

          {/* Product Price and Stock */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="price" className="block mb-2 font-medium">
                ราคา (บาท) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="price"
                {...register("price", { 
                  required: "กรุณากรอกราคาสินค้า",
                  min: { value: 0.01, message: "ราคาสินค้าต้องมากกว่า 0" }
                })}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.price ? "border-red-500" : ""
                }`}
                placeholder="0.00"
                step="0.01"
              />
              {errors.price && (
                <p className="mt-1 text-red-500 text-sm">{errors.price.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="stock" className="block mb-2 font-medium">
                จำนวนในคลัง <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="stock"
                {...register("stock", { 
                  required: "กรุณากรอกจำนวนสินค้า",
                  min: { value: 0, message: "จำนวนสินค้าต้องไม่ต่ำกว่า 0" }
                })}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.stock ? "border-red-500" : ""
                }`}
                placeholder="0"
              />
              {errors.stock && (
                <p className="mt-1 text-red-500 text-sm">{errors.stock.message}</p>
              )}
            </div>
          </div>

          {/* Category */}
          <div className="mb-4">
            <label htmlFor="category_id" className="block mb-2 font-medium">
              หมวดหมู่ <span className="text-red-500">*</span>
            </label>
            <select
              id="category_id"
              {...register("category_id", {
                required: "กรุณาเลือกหมวดหมู่",
                validate: (value) => Number(value) > 0 || "กรุณาเลือกหมวดหมู่",
              })}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.category_id ? "border-red-500" : ""
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
          <div className="mb-6">
            <label htmlFor="image" className="block mb-2 font-medium">
              รูปภาพสินค้า <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleUploadButtonClick}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              <input 
                type="hidden" 
                {...register("image_url")} 
              />
            </div>
            {imagePreview && (
              <div className="mt-2">
                <p className="mb-1 text-sm">ตัวอย่างรูปภาพ:</p>
                <img 
                  src={imagePreview} 
                  alt="Product preview" 
                  className="h-40 object-contain border rounded-md"
                />
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-center">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-6 py-2 rounded-md text-white font-medium ${
                isSubmitting 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none'
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