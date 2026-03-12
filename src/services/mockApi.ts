import { UserProfile, Restaurant, Order } from '../types';

export const mockUserProfile: UserProfile = {
  name: "Alex",
  address: "123 Tech Lane, Apt 4B",
  preferences: ["No cilantro", "Likes spicy food", "Often orders light meals for lunch"],
  orderHistory: [
    {
      id: "ord_1",
      restaurantId: "r1",
      restaurantName: "Healthy Bites",
      items: [
        { itemId: "m1", name: "Chicken Salad", quantity: 2, price: 10, notes: "No dressing" }
      ],
      total: 20,
      status: "delivered",
      deliveryAddress: "123 Tech Lane, Apt 4B"
    },
    {
      id: "ord_2",
      restaurantId: "r2",
      restaurantName: "Pizza Hut",
      items: [
        { itemId: "m3", name: "Super Supreme Pizza", quantity: 1, price: 20 },
        { itemId: "m4", name: "Fries", quantity: 1, price: 5 }
      ],
      total: 25,
      status: "delivered",
      deliveryAddress: "123 Tech Lane, Apt 4B"
    }
  ]
};

export const mockRestaurants: Restaurant[] = [
  {
    id: "r1",
    name: "Healthy Bites",
    cuisine: "Healthy, Salads",
    menu: [
      { id: "m1", name: "Chicken Salad", price: 10, inStock: true },
      { id: "m2", name: "Quinoa Bowl", price: 12, inStock: true }
    ]
  },
  {
    id: "r2",
    name: "Pizza Hut",
    cuisine: "Pizza, Fast Food",
    menu: [
      { id: "m3", name: "Super Supreme Pizza", price: 20, inStock: true },
      { id: "m4", name: "Fries", price: 5, inStock: false }, // Out of stock to test exception handling
      { id: "m5", name: "Roasted Chicken Wings", price: 8, inStock: true }
    ]
  },
  {
    id: "r3",
    name: "Spicy Sichuan",
    cuisine: "Chinese, Spicy",
    menu: [
      { id: "m6", name: "Kung Pao Chicken", price: 15, inStock: true },
      { id: "m7", name: "Mapo Tofu", price: 12, inStock: true }
    ]
  }
];

export const draftOrders: Record<string, Order> = {};

export const api = {
  getUserProfile: async () => {
    return mockUserProfile;
  },
  searchRestaurants: async (query?: string, cuisine?: string) => {
    let results = mockRestaurants;
    if (cuisine) {
      results = results.filter(r => r.cuisine.toLowerCase().includes(cuisine.toLowerCase()));
    }
    if (query) {
      results = results.filter(r => r.name.toLowerCase().includes(query.toLowerCase()));
    }
    return results.map(r => ({ id: r.id, name: r.name, cuisine: r.cuisine }));
  },
  getRestaurantMenu: async (restaurantId: string) => {
    const restaurant = mockRestaurants.find(r => r.id === restaurantId);
    if (!restaurant) throw new Error("Restaurant not found");
    return restaurant.menu;
  },
  draftOrder: async (restaurantId: string, items: {itemId: string, quantity: number, notes?: string}[], deliveryAddress: string, deliveryTime?: string) => {
    const restaurant = mockRestaurants.find(r => r.id === restaurantId);
    if (!restaurant) throw new Error("Restaurant not found");

    let total = 0;
    const orderItems = [];
    for (const item of items) {
      const menuItem = restaurant.menu.find(m => m.id === item.itemId);
      if (!menuItem) throw new Error(`Item ${item.itemId} not found`);
      if (!menuItem.inStock) throw new Error(`Item ${menuItem.name} is out of stock`);
      
      total += menuItem.price * item.quantity;
      orderItems.push({
        itemId: menuItem.id,
        name: menuItem.name,
        quantity: item.quantity,
        price: menuItem.price,
        notes: item.notes
      });
    }

    const orderId = `draft_${Math.random().toString(36).substring(2, 9)}`;
    const order: Order = {
      id: orderId,
      restaurantId,
      restaurantName: restaurant.name,
      items: orderItems,
      total,
      status: 'draft',
      deliveryAddress,
      deliveryTime
    };
    draftOrders[orderId] = order;
    return { orderId, total, status: 'draft', order };
  },
  requestPayment: async (orderId: string) => {
    const order = draftOrders[orderId];
    if (!order) throw new Error("Order not found");
    return { success: true, message: "Payment requested. Waiting for user confirmation." };
  },
  confirmPayment: async (orderId: string) => {
    const order = draftOrders[orderId];
    if (!order) throw new Error("Order not found");
    order.status = 'paid';
    return { success: true, message: "Payment confirmed. Order is being prepared." };
  }
};
