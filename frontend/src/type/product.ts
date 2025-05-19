export interface FormProduct{
  id_products: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  image_url: string;
  category_id: number;
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
  };
   data?: any;
}