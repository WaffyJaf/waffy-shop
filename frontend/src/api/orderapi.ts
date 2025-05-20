import axios from 'axios';
import { CartItem } from '../type/cart';

export const addProductToCart = async (userId: string, productId: number, quantity: number) => {
  const response = await axios.post('http://localhost:3000/order/addcart', {
    userId,
    productId,
    quantity,
  });

  return response.data;
};

export const getCartItems = async (userId: number): Promise<CartItem[]> => {
  const response = await fetch(`http://localhost:3000/order/${userId}`, {
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'ไม่สามารถดึงข้อมูลตะกร้าได้');
  }
  return response.json();
};

export const updateCartItemQuantity = async (itemId: string, quantity: number) => {
  const response = await fetch(`http://localhost:3000/order/${itemId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ quantity }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'ไม่สามารถอัปเดตจำนวนสินค้าได้');
  }
  return response.json();
};

export const removeCartItem = async (itemId: string) => {
  const response = await fetch(`http://localhost:3000/order/${itemId}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'ไม่สามารถลบสินค้าออกจากตะกร้าได้');
  }
  return response.json();
};