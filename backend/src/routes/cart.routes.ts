import { Router, Request, Response } from 'express';
import { body, param, validationResult } from 'express-validator';
import { authenticateToken } from '../middlewares/auth.middleware';
import CartItem from '../models/cart.model';
import Product from '../models/product.model';
import { logger } from '../utils/logger';
import sequelize from '../config/database';

const router = Router();

router.use(authenticateToken);

// 获取购物车列表
router.get('/', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const items = await CartItem.findAll({
      where: { user_id: userId },
      include: [{
        model: Product,
        as: 'product',
        attributes: ['id', 'name', 'price', 'main_image', 'stock', 'status']
      }],
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: items
    });
  } catch (error) {
    logger.error('获取购物车失败:', error);
    res.status(500).json({ success: false, message: '服务器内部错误' });
  }
});

// 添加商品到购物车
router.post('/', [
  body('product_id').isInt({ min: 1 }).withMessage('商品 ID 无效'),
  body('quantity').optional().isInt({ min: 1 }).toInt(),
  body('checked').optional().isBoolean()
], async (req: Request, res: Response) => {
  const transaction = await sequelize.transaction();
  
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      await transaction.rollback();
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const userId = (req as any).user.id;
    const { product_id, quantity = 1, checked = true } = req.body;

    // 检查商品是否存在
    const product = await Product.findByPk(product_id, { transaction });
    if (!product) {
      await transaction.rollback();
      return res.status(400).json({ 
        success: false, 
        message: '商品不存在' 
      });
    }

    // 检查商品是否上架
    if (product.status === 0) {
      await transaction.rollback();
      return res.status(400).json({ 
        success: false, 
        message: '商品已下架' 
      });
    }

    // 检查是否已在购物车中
    const existingItem = await CartItem.findOne({
      where: { user_id: userId, product_id }
    });

    if (existingItem) {
      // 已存在则增加数量
      existingItem.quantity += quantity;
      existingItem.checked = checked;
      await existingItem.save({ transaction });
      
      await transaction.commit();
      
      res.json({ 
        success: true, 
        message: '购物车更新成功',
        data: existingItem
      });
    } else {
      // 不存在则创建新项
      const newItem = await CartItem.create({
        user_id: userId,
        product_id,
        quantity,
        checked
      }, { transaction });
      
      await transaction.commit();
      
      // 获取完整信息
      const fullItem = await CartItem.findByPk(newItem.id, {
        include: [{
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'price', 'main_image', 'stock', 'status']
        }]
      });
      
      res.status(201).json({ 
        success: true, 
        message: '商品已添加到购物车',
        data: fullItem
      });
    }
  } catch (error) {
    await transaction.rollback();
    logger.error('添加商品到购物车失败:', error);
    res.status(500).json({ success: false, message: '服务器内部错误' });
  }
});

// 更新购物车商品数量
router.put('/:id', [
  param('id').isInt({ min: 1 }).toInt(),
  body('quantity').isInt({ min: 1 }).toInt(),
  body('checked').optional().isBoolean()
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const userId = (req as any).user.id;
    const itemId = req.params.id;
    const { quantity, checked } = req.body;

    const item = await CartItem.findOne({
      where: { id: itemId, user_id: userId },
      include: [{
        model: Product,
        as: 'product',
        attributes: ['id', 'name', 'price', 'main_image', 'stock', 'status']
      }]
    });

    if (!item) {
      return res.status(404).json({ 
        success: false, 
        message: '购物车商品不存在' 
      });
    }

    // 更新数量和选中状态
    if (quantity) item.quantity = quantity;
    if (checked !== undefined) item.checked = checked;
    
    await item.save();

    res.json({ 
      success: true, 
      message: '购物车更新成功',
      data: item
    });
  } catch (error) {
    logger.error('更新购物车失败:', error);
    res.status(500).json({ success: false, message: '服务器内部错误' });
  }
});

// 删除购物车商品
router.delete('/:id', [
  param('id').isInt({ min: 1 }).toInt()
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const userId = (req as any).user.id;
    const itemId = req.params.id;

    const item = await CartItem.findOne({
      where: { id: itemId, user_id: userId }
    });

    if (!item) {
      return res.status(404).json({ 
        success: false, 
        message: '购物车商品不存在' 
      });
    }

    await item.destroy();

    res.json({ 
      success: true, 
      message: '删除成功' 
    });
  } catch (error) {
    logger.error('删除购物车商品失败:', error);
    res.status(500).json({ success: false, message: '服务器内部错误' });
  }
});

// 清空购物车
router.delete('/', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    await CartItem.destroy({
      where: { user_id: userId }
    });

    res.json({ 
      success: true, 
      message: '购物车已清空' 
    });
  } catch (error) {
    logger.error('清空购物车失败:', error);
    res.status(500).json({ success: false, message: '服务器内部错误' });
  }
});

// 批量更新购物车商品选中状态
router.patch('/batch-update', [
  body('product_ids').isArray({ min: 1 }).withMessage('商品 ID 列表不能为空'),
  body('product_ids.*').isInt({ min: 1 }).withMessage('商品 ID 无效'),
  body('checked').isBoolean().withMessage('选中状态必须为布尔值')
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const userId = (req as any).user.id;
    const { product_ids, checked } = req.body;

    await CartItem.update(
      { checked },
      {
        where: {
          user_id: userId,
          product_id: product_ids
        }
      }
    );

    res.json({ 
      success: true, 
      message: '批量更新成功' 
    });
  } catch (error) {
    logger.error('批量更新购物车失败:', error);
    res.status(500).json({ success: false, message: '服务器内部错误' });
  }
});

export default router;
