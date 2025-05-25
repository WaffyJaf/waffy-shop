import axios from 'axios';

export interface Category {
  id_categories: number;
  name: string;
}

export interface CategoryResponse {
  success: boolean;
  message: string;
  data: Category[];
}  

const API_URL = import.meta.env.VITE_API_URL;
// Get all categories
export const getAllCategories = async (): Promise<Category[]> => {
  try {
    const response = await axios.get(`${API_URL}/category/`);
    const data = response.data;

    console.log('API Response for categories (raw):', data); // Log raw response
    console.log('API Response status:', response.status); // Log status

    // ตรวจสอบและดึง data ออกมา
    if (data && typeof data === 'object' && Array.isArray(data.data)) {
      console.log('Extracted categories:', data.data);
      return data.data;
    } else {
      console.warn('No valid categories array found in data, returning empty array');
      return [];
    }
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
};
// Create a new category
export const createCategory = async (name: string): Promise<{ success: boolean; message: string; category?: Category }> => {
  try {
    const response = await axios.post(
      `${API_URL}/category/createcategory`,
      { name },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.status === 201) {
      return { 
        success: true, 
        message: 'เพิ่มหมวดหมู่สำเร็จ',
        category: response.data.category 
      };
    } else {
      return { success: false, message: 'เกิดข้อผิดพลาดในการเพิ่มหมวดหมู่' };
    }
  } catch (error) {
    console.error('Error creating category:', error);
    return { success: false, message: 'เกิดข้อผิดพลาดในการเพิ่มหมวดหมู่' };
  }
};

// Delete a category
export const deleteCategory = async (id: number): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await axios.delete(`${API_URL}/category/delete/${id}`);

    if (response.status === 200) {
      return { success: true, message: 'ลบหมวดหมู่เรียบร้อย' };
    } else {
      return { success: false, message: 'ไม่สามารถลบหมวดหมู่ได้' };
    }
  } catch (error) {
    console.error('Error deleting category:', error);
    return { success: false, message: 'ไม่สามารถลบหมวดหมู่ได้' };
  }
};