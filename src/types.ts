export interface UserProfile {
  name: string;
  address: string;
  preferences: string[];
  orderHistory: Order[];
}

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  inStock: boolean;
}

export interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  menu: MenuItem[];
}

export interface OrderItem {
  itemId: string;
  name: string;
  quantity: number;
  price: number;
  notes?: string;
}

export interface Order {
  id: string;
  restaurantId: string;
  restaurantName: string;
  items: OrderItem[];
  total: number;
  status: 'draft' | 'paid' | 'cancelled' | 'delivered';
  deliveryAddress: string;
  deliveryTime?: string;
}

export interface Message {
  id: string;
  role: 'user' | 'model' | 'system';
  text: string;
  isPaymentRequest?: boolean;
  orderId?: string;
  toolCalls?: any[];
}
