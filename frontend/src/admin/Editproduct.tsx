import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductById, updateProduct, uploadImage } from '../api/productapi.ts';
import { FormProduct } from '../type/product.ts';
import Navbar from '../component/Navbar.tsx';
import Swal from 'sweetalert2';

const EditProduct: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<FormProduct | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // ดึงข้อมูลสินค้าตาม ID
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        if (id) {
          const data = await getProductById(Number(id));
          setProduct(data);
          // แก้ไขให้ตรวจสอบ URL ที่ได้รับว่ามี http หรือไม่
          setImagePreview(data.image_url 
            ? data.image_url.startsWith('http') 
              ? data.image_url 
              : `http://localhost:3000${data.image_url}` 
            : null);
          setLoading(false);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการดึงข้อมูลสินค้า');
        setLoading(false);
        console.error(err);
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการดึงข้อมูลสินค้า',
          confirmButtonColor: '#d33',
          customClass: {
            popup: 'animate__animated animate__fadeInDown',
          },
        });
      }
    };
    fetchProduct();
  }, [id]);

  // จัดการการเปลี่ยนแปลงข้อมูลในฟอร์ม
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // แก้ไขการตรวจสอบ type เพื่อรองรับ checkbox
    if (type === 'checkbox') {
      const isChecked = (e.target as HTMLInputElement).checked;
      setProduct(prev => prev ? { ...prev, [name]: isChecked } : null);
    } else if (type === 'number') {
      setProduct(prev => prev ? { ...prev, [name]: Number(value) } : null);
    } else {
      setProduct(prev => prev ? { ...prev, [name]: value } : null);
    }
  };

  // จัดการการเลือกไฟล์
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // แสดงตัวอย่างรูปภาพ
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadImage = async () => {
    if (!selectedFile || !id) return;

    try {
      const newImageUrl = await uploadImage(selectedFile);
      // แก้ไขการอัพเดท product และตรวจสอบ URL
      if (product) {
        const updatedProduct = { ...product, image_url: newImageUrl };
        setProduct(updatedProduct);
        
        // อัพเดทการแสดงรูปภาพ
        setImagePreview(newImageUrl.startsWith('http') 
          ? newImageUrl 
          : `http://localhost:3000${newImageUrl}`);
      }

      Swal.fire({
        icon: 'success',
        title: 'อัปโหลดรูปภาพสำเร็จ',
        showConfirmButton: false,
        timer: 1500,
        customClass: {
          popup: 'animate__animated animate__fadeOutUp',
        },
      });
    } catch (err) {
      console.error('เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ:', err);
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: err instanceof Error ? err.message : 'ไม่สามารถอัปโหลดรูปภาพได้',
        confirmButtonColor: '#d33',
        customClass: {
          popup: 'animate__animated animate__fadeInDown',
        },
      });
    }
  };

  // บันทึกการอัปเดตสินค้า
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !id) return;

    const result = await Swal.fire({
      title: 'คุณแน่ใจหรือไม่?',
      text: 'คุณต้องการบันทึกการเปลี่ยนแปลงนี้หรือไม่?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'ใช่, บันทึก!',
      cancelButtonText: 'ยกเลิก',
      customClass: {
        popup: 'animate__animated animate__fadeInDown',
      },
    });

    if (result.isConfirmed) {
      try {
        // สร้าง productData ที่จะส่งไปอัพเดท
        const productData = {
          ...product,
          price: Number(product.price),  // แปลงให้เป็นตัวเลขอย่างชัดเจน
          stock: Number(product.stock),  // แปลงให้เป็นตัวเลขอย่างชัดเจน
          category_id: Number(product.category_id) // แปลงให้เป็นตัวเลขอย่างชัดเจน
        };
        
        await updateProduct(Number(id), productData);
        Swal.fire({
          icon: 'success',
          title: 'อัปเดตสินค้าสำเร็จ',
          showConfirmButton: false,
          timer: 1500,
          customClass: {
            popup: 'animate__animated animate__fadeOutUp',
          },
        });
        navigate('/manageproduct');
      } catch (err) {
        console.error('เกิดข้อผิดพลาดในการอัปเดตสินค้า:', err);
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการอัปเดตสินค้า',
          confirmButtonColor: '#d33',
          customClass: {
            popup: 'animate__animated animate__fadeInDown',
          },
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-sky-900">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-amber-300"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-sky-900">
        <div className="text-center text-red-600 bg-red-100 p-6 rounded-lg shadow-lg">
          {error || 'ไม่พบสินค้า'}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-sky-900">
      <Navbar />
      <div className="container mx-auto p-8">
        <span className="text-4xl font-bold text-white flex items-center mb-8">
          <i className="fa-solid fa-pen-to-square mr-3 text-amber-300"></i> แก้ไขสินค้า
        </span>
        <div className="bg-white rounded-xl shadow-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">ชื่อสินค้า</label>
              <input
                type="text"
                name="name"
                value={product.name || ''}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">คำอธิบาย</label>
              <textarea
                name="description"
                value={product.description || ''}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                rows={4}
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">ราคา</label>
              <input
                type="number"
                name="price"
                value={product.price || 0}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                required
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">สต็อก</label>
              <input
                type="number"
                name="stock"
                value={product.stock || 0}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                required
                min="0"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">รูปภาพปัจจุบัน</label>
              {imagePreview && (
                <div className="mb-4">
                  <img
                    src={imagePreview}
                    alt={product.name || 'สินค้า'}
                    className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                    onError={(e) => (e.currentTarget.src = '/logo_waffy.png')}
                  />
                </div>
              )}
              <label className="block text-gray-700 font-semibold mb-2">อัปโหลดรูปภาพใหม่</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
              />
              <button
                type="button"
                onClick={handleUploadImage}
                className="mt-2 px-6 py-3 bg-amber-500 text-white font-semibold rounded-lg hover:bg-amber-600 transition-all duration-300 transform hover:scale-105 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!selectedFile}
              >
                <i className="fa-solid fa-upload mr-2"></i> อัปโหลดรูปภาพ
              </button>
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">หมวดหมู่ (Category ID)</label>
              <input
                type="number"
                name="category_id"
                value={product.category_id || 0}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                required
                min="1"
              />
            </div>
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={Boolean(product.is_active)}
                  onChange={handleChange}
                  className="mr-2 h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 transition-all duration-300"
                />
                <span className="text-gray-700 font-semibold">ใช้งาน</span>
              </label>
            </div>
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/manageproduct')}
                className="px-6 py-3 bg-gray-300 text-gray-800 font-semibold rounded-lg hover:bg-gray-400 transition-all duration-300 transform hover:scale-105 shadow-md"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 shadow-md"
              >
                <i className="fa-solid fa-save mr-2"></i> บันทึก
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProduct;