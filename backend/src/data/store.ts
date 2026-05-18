import bcrypt from 'bcryptjs';

export type Role = 'admin' | 'user';

export interface User {
  id: number;
  username: string;
  email: string;
  password: string;
  role: Role;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  originalPrice: number;
  stock: number;
  category: string;
  image: string;
  isHot: boolean;
  isNew: boolean;
}

export interface CartItem {
  id: number;
  userId: number;
  productId: number;
  quantity: number;
}

export interface OrderItem {
  productId: number;
  productName: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface Order {
  id: number;
  userId: number;
  orderNo: string;
  totalAmount: number;
  status: 'pending' | 'paid' | 'shipped';
  items: OrderItem[];
  createdAt: string;
}

const hashed = bcrypt.hashSync('password123', 10);

export const users: User[] = [
  { id: 1, username: 'admin', email: 'admin@example.com', password: hashed, role: 'admin' },
  { id: 2, username: 'user1', email: 'user1@example.com', password: hashed, role: 'user' },
  { id: 3, username: 'user2', email: 'user2@example.com', password: hashed, role: 'user' }
];

export const products: Product[] = [
  {
    id: 1,
    name: 'iPhone 15 Pro Max',
    description: '苹果最新旗舰手机',
    price: 9999,
    originalPrice: 10999,
    stock: 50,
    category: '手机数码',
    image: 'https://picsum.photos/id/160/800/600',
    isHot: true,
    isNew: true
  },
  {
    id: 2,
    name: 'MacBook Pro 16英寸',
    description: '苹果专业级笔记本电脑',
    price: 19999,
    originalPrice: 21999,
    stock: 30,
    category: '电脑办公',
    image: 'https://picsum.photos/id/180/800/600',
    isHot: true,
    isNew: true
  },
  {
    id: 3,
    name: '夏季连衣裙',
    description: '女士夏季新款连衣裙',
    price: 299,
    originalPrice: 399,
    stock: 200,
    category: '服装鞋包',
    image: 'https://picsum.photos/id/838/800/600',
    isHot: true,
    isNew: true
  }
];

export const cartItems: CartItem[] = [];
export const orders: Order[] = [];
