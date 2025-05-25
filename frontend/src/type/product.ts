export interface FormProduct{
  id_products: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  image_url: string;
  category_id: number;
  is_active: boolean;
}

export interface AddProductResponse {
  success: boolean;
  message: string;
  product?: {
    id_products: number;
    name: string;
    description: string;
    price: string | number;
    stock: number;
    image_url?: string;
    category_id?: number;
    is_active: boolean;
  };
   data?: any;
}

export interface OrderItem {
  product_id: number;
  quantity: number;
  price: number;
}

export interface Order {
  id: number;
  user_id: number;
  total: number;
  status: OrderStatus;
  created_at: string;
  updated_at: string;
  order_items: OrderItemDetail[];
  payments: Payment[];
}

export interface OrderItemDetail {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  price: number;
  products: FormProduct;
}

export interface Payment {
  id: number;
  order_id: number;
  amount: number;
  slip_image?: string;
  status: PaymentStatus;
  paid_at?: string;
  created_at: string;
}

export enum OrderStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  CANCELED = 'CANCELED',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
}
