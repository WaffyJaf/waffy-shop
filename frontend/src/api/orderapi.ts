import axios from 'axios';
import { CartItem } from '../type/cart.ts';
import {  Order } from '../type/product.ts';

const API_URL = import.meta.env.VITE_API_URL;
export const addProductToCart = async (userId: number, productId: number, quantity: number) => {
  const response = await axios.post(`${API_URL}/order/addcart`, {
    userId,
    productId,
    quantity,
  });

  return response.data;
};

export const getCartItems = async (userId: number): Promise<CartItem[]> => {
  const response = await fetch(`${API_URL}/order/${userId}`, {
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'ไม่สามารถดึงข้อมูลตะกร้าได้');
  }
  return response.json();
};

export const updateCartItemQuantity = async (itemId: string, quantity: number) => {
  const response = await fetch(`${API_URL}/order/${itemId}`, {
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
  const response = await fetch(`${API_URL}/order/${itemId}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'ไม่สามารถลบสินค้าออกจากตะกร้าได้');
  }
  return response.json();
};


export const createOrder = async (userId: number, cartItems: any[]) => {
  try {
    const items = cartItems.map(item => ({
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.product.price,
    }));
    const total = items.reduce((sum, item) => sum + item.quantity * item.price, 0);
    const response = await axios.post(`${API_URL}/order/createorder`, { userId, items, total });
    return response.data;
  } catch (error) {
    throw new Error('Failed to create order');
  }
};

export const getOrdersByUser = async (userId: number): Promise<Order[]> => {
  try {
    const response = await axios.get(`${API_URL}/order/get/${userId}`);
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch orders');
  }
};

export const uploadPaymentSlip = async (orderId: number, amount: number, slip: File) => {
  const formData = new FormData();
  formData.append('orderId', orderId.toString());
  formData.append('amount', amount.toString());
  formData.append('slip', slip);

  try {
    const response = await axios.post(`${API_URL}/order/payment`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error) {
    throw new Error('Failed to upload payment slip');
  }
};
