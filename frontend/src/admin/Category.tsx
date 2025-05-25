import  { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { getAllCategories, createCategory, deleteCategory, Category } from '../api/categoryapi.ts';
import Swal from 'sweetalert2';
import Navbar from '../component/Navbar.tsx';

interface CategoryFormData {
  name: string;
}

const CategoryManagementPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const { 
    register, 
    handleSubmit, 
    reset,
    formState: { errors } 
  } = useForm<CategoryFormData>({
    defaultValues: {
      name: ''
    }
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  // Function to fetch categories
  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const data = await getAllCategories();
      console.log('Fetched categories:', data); // Log ข้อมูลที่ได้หลังประมวลผล
      setCategories(data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: 'ไม่สามารถดึงข้อมูลหมวดหมู่ได้',
        confirmButtonText: 'ตกลง'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit: SubmitHandler<CategoryFormData> = async (data) => {
    setIsSubmitting(true);
    
    Swal.fire({
      title: 'กำลังดำเนินการ',
      text: 'กรุณารอสักครู่...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
    
    try {
      const result = await createCategory(data.name);
      
      if (result.success) {
        Swal.fire({
          icon: 'success',
          title: 'สำเร็จ!',
          text: 'เพิ่มหมวดหมู่เรียบร้อยแล้ว',
          confirmButtonText: 'ตกลง'
        });
        
        reset({ name: '' });
        fetchCategories();
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      let errorMessage = 'เกิดข้อผิดพลาดในการเพิ่มหมวดหมู่';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: errorMessage,
        confirmButtonText: 'ตกลง'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = async (id: number, name: string) => {
    const result = await Swal.fire({
      title: 'ยืนยันการลบ',
      text: `คุณต้องการลบหมวดหมู่ "${name}" ใช่หรือไม่?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'ลบ',
      cancelButtonText: 'ยกเลิก'
    });

    if (result.isConfirmed) {
      Swal.fire({
        title: 'กำลังดำเนินการ',
        text: 'กรุณารอสักครู่...',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });
      
      try {
        const response = await deleteCategory(id);
        
        if (response.success) {
          Swal.fire({
            icon: 'success',
            title: 'สำเร็จ!',
            text: 'ลบหมวดหมู่เรียบร้อยแล้ว',
            confirmButtonText: 'ตกลง'
          });
          fetchCategories();
        } else {
          throw new Error(response.message);
        }
      } catch (error) {
        let errorMessage = 'ไม่สามารถลบหมวดหมู่ได้';
        if (error instanceof Error) {
          errorMessage = error.message;
        }
        
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: errorMessage,
          confirmButtonText: 'ตกลง'
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-gray-950 to-sky-950 ">
      <Navbar/>
    <div className="container mx-auto p-4">
      
      {/* Add Category Form */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <span className="text-2xl font-semibold mb-4">เพิ่มหมวดหมู่ใหม่</span>
        <i className="fa-solid fa-plus ml-3 fa-xl mb-4"></i>
        
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col md:flex-row gap-4">
          <div className="flex-grow">
            <input
              type="text"
              {...register("name", { 
                required: "กรุณาระบุชื่อหมวดหมู่" 
              })}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.name ? "border-red-500" : ""
              }`}
              placeholder="ชื่อหมวดหมู่"
            />
            {errors.name && (
              <p className="mt-1 text-red-500 text-sm">{errors.name.message}</p>
            )}
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-6 py-2 rounded-md text-white font-medium ${
              isSubmitting 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none'
            }`}
          >
            {isSubmitting ? 'กำลังดำเนินการ...' : 'เพิ่มหมวดหมู่'}
          </button>
        </form>
      </div>
      
      {/* Categories List */}
      <div className="bg-white rounded-lg shadow-md p-6">
        
        <span className="text-2xl font-semibold mb-4"><i className="fa-solid fa-bars mr-3 text-amber-300"></i>รายการหมวดหมู่</span>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            ไม่พบข้อมูลหมวดหมู่
          </div>
        ) : (
          <div className="overflow-x-auto ">
            <table className="min-w-full divide-y divide-gray-200 mt-6 ">
              <thead className="bg-yellow-400 ">
                <tr>
                  <th className="px-6 py-3 text-left text-xm font-medium text-gray-950 uppercase tracking-wider">
                    ไอดี
                  </th>
                  <th className="px-6 py-3 text-left text-xm font-medium text-gray-950 uppercase tracking-wider">
                    ชื่อหมวดหมู่
                  </th>
                  <th className="px-6 py-3 text-right text-xm font-medium text-gray-950 uppercase tracking-wider">
                    จัดการ
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {categories.map((category) => (
                  <tr key={category.id_categories} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{category.id_categories}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{category.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleDeleteCategory(category.id_categories, category.name)}
                        className="flex items-center bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 duration-300 transform hover:scale-105"
                        >
                          <i className="fa-solid fa-trash mr-2"></i> ลบ
                        </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  </div>
  );
};

export default CategoryManagementPage;