import { Router } from 'express';
import Category from '../models/category.model';

const router = Router();

router.get('/', async (_req, res) => {
  try {
    const categories = await Category.findAll({
      where: { status: 1 },
      order: [['sort', 'ASC'], ['id', 'ASC']]
    });
    res.json({ success: true, data: categories });
  } catch (error) {
    console.error('获取分类失败:', error);
    res.status(500).json({ success: false, message: '服务器内部错误' });
  }
});

export default router;
