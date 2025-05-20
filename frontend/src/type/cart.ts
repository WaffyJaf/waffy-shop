export interface CartItem {
  id: string;
  product_id: number;
  quantity: number;
  product: {
    id_products: number;
    name: string;
    price: number;
    image_url?: string;
    stock: number;
  };
}