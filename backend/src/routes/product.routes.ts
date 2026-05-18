import { Router } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import Product from '../models/product.model';
import { authenticateToken } from '../middlewares/auth.middleware';
import { adminMiddleware } from '../middlewares/admin.middleware';
import { logger } from '../utils/logger';

const router = Router();

// 获取商品列表（带分页、筛选、排序）
router.get('/', [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('category_id').optional().isInt({ min: 1 }).toInt(),
  query('keyword').optional().trim().escape(),
  query('min_price').optional().isFloat({ min: 0 }).toFloat(),
  query('max_price').optional().isFloat({ min: 0 }).toFloat(),
  query('status').optional().isIn(['0', '1', 'all']),
  query('sort').optional().isIn(['price_asc', 'price_desc', 'sales_desc', 'newest']),
], async (req, res) => {
  try {
    // 验证参数
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const {
      page = 1,
      limit = 10,
      category_id,
      keyword,
      min_price,
      max_price,
      status,
      sort = 'newest'
    } = req.query as any;

    // 构建查询条件
    const where: any = {};
    
    // 过滤已删除的商品
    where.deleted_at = null;
    
    // 管理后台显示所有商品，包括已下架的
    if (status !== undefined && status !== 'all') {
      where.status = status;
    } else if (status === undefined) {
      where.status = 1; // 1-上架 (默认只显示上架商品)
    }
    // 当status=all时，不设置status条件，显示所有商品
    
    if (category_id) where.category_id = category_id;
    
    // 价格范围
    if (min_price || max_price) {
      where.price = {};
      if (min_price) where.price[Symbol.for('gte')] = min_price;
      if (max_price) where.price[Symbol.for('lte')] = max_price;
    }

    // 关键词搜索
    if (keyword) {
      where[Symbol.for('or')] = [
        { name: { [Symbol.for('like')]: `%${keyword}%` } },
        { description: { [Symbol.for('like')]: `%${keyword}%` } },
        { brand: { [Symbol.for('like')]: `%${keyword}%` } }
      ];
    }

    // 排序
    let order: any[] = [];
    switch (sort) {
      case 'price_asc':
        order = [['price', 'ASC']];
        break;
      case 'price_desc':
        order = [['price', 'DESC']];
        break;
      case 'sales_desc':
        order = [['sales', 'DESC']];
        break;
      case 'newest':
      default:
        order = [['updated_at', 'DESC']]; // 默认按编辑时间倒序排列
        break;
    }

    // 查询商品
    const { count, rows } = await Product.findAndCountAll({
      where,
      order,
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    });

    res.json({
      success: true,
      data: rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        total_pages: Math.ceil(count / parseInt(limit))
      }
    });
  } catch (error) {
    logger.error('获取商品列表失败:', error);
    res.status(500).json({ success: false, message: '服务器内部错误' });
  }
});

// 获取热门商品
router.get('/hot', async (_req, res) => {
  try {
    const products = await Product.findAll({
      where: { status: 1 },
      order: [['sales', 'DESC']],
      limit: 8
    });
    
    res.json({ success: true, data: products });
  } catch (error) {
    logger.error('获取热门商品失败:', error);
    res.status(500).json({ success: false, message: '服务器内部错误' });
  }
});

// 获取新品
router.get('/new', async (_req, res) => {
  try {
    const products = await Product.findAll({
      where: { status: 1 },
      order: [['created_at', 'DESC']],
      limit: 8
    });
    
    res.json({ success: true, data: products });
  } catch (error) {
    logger.error('获取新品失败:', error);
    res.status(500).json({ success: false, message: '服务器内部错误' });
  }
});

// 获取单个商品详情
router.get('/:id', [
  param('id').isInt({ min: 1 }).toInt()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const product = await Product.findByPk(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: '商品不存在' });
    }

    res.json({ success: true, data: product });
  } catch (error) {
    logger.error('获取商品详情失败:', error);
    res.status(500).json({ success: false, message: '服务器内部错误' });
  }
});

// 创建商品（需要管理员权限）
router.post('/', [
  authenticateToken,
  adminMiddleware,
  body('name').trim().notEmpty().withMessage('商品名称不能为空').isLength({ max: 200 }),
  body('category_id').isInt({ min: 1 }).withMessage('分类ID无效'),
  body('price').isFloat({ min: 0 }).withMessage('价格必须大于0'),
  body('market_price').optional().isFloat({ min: 0 }),
  body('stock').optional().isInt({ min: 0 }).default(0),
  body('brand').optional().trim().isLength({ max: 50 }),
  body('main_image').optional().trim(),
  body('images').optional(),
  body('description').optional().trim(),
  body('detail').optional().trim(),
  body('status').optional().isIn([0, 1]).default(1)
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    // 分类检查暂时移除，后续可添加

    const product = await Product.create({
      ...req.body,
      sales: 0
    });

    res.status(201).json({
      success: true,
      message: '商品创建成功',
      data: product
    });
  } catch (error) {
    logger.error('创建商品失败:', error);
    res.status(500).json({ success: false, message: '服务器内部错误' });
  }
});

// 更新商品（需要管理员权限）
router.put('/:id', [
  authenticateToken,
  adminMiddleware,
  param('id').isInt({ min: 1 }).toInt(),
  body('name').optional().trim().notEmpty().isLength({ max: 200 }),
  body('category_id').optional().isInt({ min: 1 }),
  body('price').optional().isFloat({ min: 0 }),
  body('market_price').optional().isFloat({ min: 0 }),
  body('stock').optional().isInt({ min: 0 }),
  body('brand').optional().trim().isLength({ max: 50 }),
  body('main_image').optional().trim(),
  body('images').optional(),
  body('description').optional().trim(),
  body('detail').optional().trim(),
  body('status').optional().isIn([0, 1])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: '商品不存在' });
    }

    // 分类检查暂时移除，后续可添加

    await product.update(req.body);

    res.json({
      success: true,
      message: '商品更新成功',
      data: product
    });
  } catch (error) {
    logger.error('更新商品失败:', error);
    res.status(500).json({ success: false, message: '服务器内部错误' });
  }
});

// 删除商品（需要管理员权限）
router.delete('/:id', [
  authenticateToken,
  adminMiddleware,
  param('id').isInt({ min: 1 }).toInt()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: '商品不存在' });
    }

    // 软删除商品，设置deleted_at字段为当前时间
    await product.update({ deleted_at: new Date() });

    res.json({
      success: true,
      message: '商品删除成功'
    });
  } catch (error) {
    logger.error('删除商品失败:', error);
    res.status(500).json({ success: false, message: '服务器内部错误' });
  }
});

// 批量更新商品状态（需要管理员权限）
router.patch('/batch-status', [
  authenticateToken,
  adminMiddleware,
  body('ids').isArray().withMessage('商品ID列表必须为数组'),
  body('ids.*').isInt({ min: 1 }).withMessage('商品ID无效'),
  body('status').isIn([0, 1]).withMessage('状态值无效')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { ids, status } = req.body;

    const result = await Product.update(
      { status },
      {
        where: { id: ids }
      }
    );

    res.json({
      success: true,
      message: `成功更新 ${result[0]} 个商品的状态`,
      data: { updated: result[0] }
    });
  } catch (error) {
    logger.error('批量更新商品状态失败:', error);
    res.status(500).json({ success: false, message: '服务器内部错误' });
  }
});

export default router;