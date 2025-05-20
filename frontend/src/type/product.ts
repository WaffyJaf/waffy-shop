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