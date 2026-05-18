import { Router } from 'express';
import { authenticateToken } from '../middlewares/auth.middleware';
import { cartItems, products } from '../data/store';

const router = Router();

router.use(authenticateToken);

router.get('/', (req, res) => {
  const userId = ((req as unknown) as { user: { id: number } }).user.id;
  const list = cartItems
    .filter((item) => item.userId === userId)
    .map((item) => {
      const product = products.find((p) => p.id === item.productId);
      return {
        ...item,
        product
      };
    });
  res.json({ success: true, data: list });
});

router.post('/', (req, res) => {
  const userId = ((req as unknown) as { user: { id: number } }).user.id;
  const { productId, quantity = 1 } = req.body as { productId?: number; quantity?: number };
  if (!productId) {
    res.status(400).json({ success: false, message: '请选择商品' });
    return;
  }
  const existing = cartItems.find((item) => item.userId === userId && item.productId === productId);
  if (existing) {
    existing.quantity += quantity;
  } else {
    cartItems.push({ id: cartItems.length + 1, userId, productId, quantity });
  }
  res.json({ success: true, message: '商品已添加到购物车' });
});

router.put('/:id', (req, res) => {
  const userId = ((req as unknown) as { user: { id: number } }).user.id;
  const id = Number.parseInt(req.params.id, 10);
  const { quantity } = req.body as { quantity?: number };
  const item = cartItems.find((c) => c.id === id && c.userId === userId);
  if (!item || !quantity) {
    res.status(404).json({ success: false, message: '购物车商品不存在' });
    return;
  }
  item.quantity = quantity;
  res.json({ success: true, message: '更新成功' });
});

router.delete('/:id', (req, res) => {
  const userId = ((req as unknown) as { user: { id: number } }).user.id;
  const id = Number.parseInt(req.params.id, 10);
  const index = cartItems.findIndex((c) => c.id === id && c.userId === userId);
  if (index < 0) {
    res.status(404).json({ success: false, message: '购物车商品不存在' });
    return;
  }
  cartItems.splice(index, 1);
  res.json({ success: true, message: '删除成功' });
});

export default router;
