export interface Product {
  id: string;
  sku: string;
  barcode: string;
  name: string;
  price: number;
  imageUrl?: string;
  weightBased?: boolean;
}

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  price: number;
}

export interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
}
