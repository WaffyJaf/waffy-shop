import axios from 'axios';
import {FormProduct , AddProductResponse} from '../type/product'



export const AddProducts = async (data: FormProduct): Promise<AddProductResponse> => {
  console.log('Starting AddProducts with data:', data);
  try {
    const response = await axios.post("http://localhost:3000/product/addproduct", data, {
      headers: { "Content-Type": "application/json" },
    });

    console.log("AddProducts response:", response.status, response.data);

    if (response.status === 201) {
      return response.data as AddProductResponse;
    } else {
      console.error("Add product failed:", response.data);
      throw new Error(response.data.message || 'ส่งข้อมูลไม่สำเร็จ กรุณาลองใหม่');
    }
  } catch (error: any) {
    console.error("Error adding product:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'เกิดข้อผิดพลาดในการเพิ่มสินค้า');
  }
};

export const uploadImage = async (file: File): Promise<string> => {
  console.log('Starting uploadImage with file:', file.name);
  const uploadData = new FormData();
  uploadData.append("image", file);

  try {
    const response = await axios.post("http://localhost:3000/product/uploadimage", uploadData);
    console.log('uploadImage response:', response.status, response.data);

    if (response.status === 200 && typeof response.data.imageUrl === 'string') {
      return response.data.imageUrl;
    } else {
      console.error("Upload failed:", response.data);
      throw new Error('ไม่สามารถอัปโหลดรูปภาพได้: ผลลัพธ์จาก API ไม่ถูกต้อง');
    }
  } catch (error: any) {
    console.error("Error uploading image:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ');
  }
};

export const getProductsByCategory = async (categoryId: number): Promise<FormProduct[]> => {
  try {
    console.log('Fetching products for category:', categoryId);
    const response = await axios.get(`http://localhost:3000/product/category/${categoryId}`, {
      timeout: 5000
    });

    console.log('Products response:', response.data);
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.status === 404) {
      console.warn(`Category ${categoryId} not found. Returning empty list.`);
      return [];
    }

    console.error('Error fetching products by category:', error);
    throw new Error('ไม่สามารถดึงข้อมูลสินค้าได้');
  }
};

export const getProducts = async (): Promise<FormProduct[]> => {
  try {
    const response = await axios.get("http://localhost:3000/product/getproduct");
    return response.data;
  } catch (error) {
    throw new Error('เกิดข้อผิดพลาดในการดึงข้อมูลสินค้า');
  }
};

export const getProductById = async (id: number): Promise<FormProduct> => {
  try {
    const response = await axios.get(`http://localhost:3000/product/${id}`);
    return response.data;
  } catch (error) {
    throw new Error('เกิดข้อผิดพลาดในการดึงข้อมูลสินค้า');
  }
};

export const deleteProduct = async (id: number): Promise<void> => {
  try {
    await axios.delete(`http://localhost:3000/product/delete/${id}`);
  } catch (error) {
    throw new Error('เกิดข้อผิดพลาดในการลบสินค้า');
  }
};

export const updateProduct = async (id: number, product:FormProduct): Promise<void> => {
  try {
    await axios.put(`http://localhost:3000/product/update/${id}`, product);
  } catch (error) {
    throw new Error('เกิดข้อผิดพลาดในการอัปเดตสินค้า');
  }

};
