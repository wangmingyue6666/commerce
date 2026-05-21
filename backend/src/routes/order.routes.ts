import { Router } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { Order, OrderItem, OrderStatus, PaymentMethod } from '../models/order.model';
import Product from '../models/product.model';
import User from '../models/user.model';
import { authenticateToken } from '../middlewares/auth.middleware';
import { adminMiddleware } from '../middlewares/admin.middleware';
import { logger } from '../utils/logger';
import sequelize from '../config/database';

const router = Router();

// 所有订单路由都需要认证
router.use(authenticateToken);

// 生成订单号
function generateOrderNo(): string {
  const date = new Date();
  const year = date.getFullYear().toString().slice(2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `ORD${year}${month}${day}${random}`;
}

// 获取订单列表（用户和管理员）
router.get('/', [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('status').optional().isIn(Object.values(OrderStatus)),
  query('start_date').optional().isISO8601(),
  query('end_date').optional().isISO8601(),
  query('keyword').optional().trim().escape()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const {
      page = 1,
      limit = 10,
      status,
      start_date,
      end_date,
      keyword
    } = req.query as any;

    const userId = (req as any).user.id;
    const isAdmin = (req as any).user.role === 'admin';

    // 构建查询条件
    const where: any = {};
    
    // 非管理员只能查看自己的订单
    if (!isAdmin) {
      where.user_id = userId;
    }
    
    if (status) where.status = status;
    
    // 日期范围
    if (start_date || end_date) {
      where.created_at = {};
      if (start_date) where.created_at[Symbol.for('gte')] = new Date(start_date);
      if (end_date) where.created_at[Symbol.for('lte')] = new Date(end_date);
    }

    // 关键词搜索（订单号、收货人、手机号）
    if (keyword) {
      where[Symbol.for('or')] = [
        { order_no: { [Symbol.for('like')]: `%${keyword}%` } },
        { receiver: { [Symbol.for('like')]: `%${keyword}%` } },
        { receiver_phone: { [Symbol.for('like')]: `%${keyword}%` } }
      ];
    }

    // 查询订单
    const { count, rows } = await Order.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'email', 'phone']
        },
        {
          model: OrderItem,
          as: 'items',
          include: [{
            model: Product,
            as: 'product',
            attributes: ['id', 'name', 'main_image']
          }]
        }
      ],
      order: [['created_at', 'DESC']],
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
    logger.error('获取订单列表失败:', error);
    res.status(500).json({ success: false, message: '服务器内部错误' });
  }
});

// 获取订单统计（管理员）
router.get('/stats', adminMiddleware, async (req, res) => {
  try {
    const { start_date, end_date } = req.query as any;
    
    const where: any = {};
    if (start_date) where.created_at = { [Symbol.for('gte')]: new Date(start_date) };
    if (end_date) where.created_at = { [Symbol.for('lte')]: new Date(end_date) };

    // 订单数量统计
    const orderCount = await Order.count({ where });
    
    // 订单金额统计
    const revenueResult = await Order.sum('final_amount', { 
      where: { ...where, status: OrderStatus.COMPLETED } 
    });
    
    // 订单状态分布
    const statusStats = await Order.findAll({
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where,
      group: ['status']
    });

    // 每日订单趋势
    const dailyTrend = await Order.findAll({
      attributes: [
        [sequelize.fn('DATE', sequelize.col('created_at')), 'date'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('final_amount')), 'amount']
      ],
      where,
      group: [sequelize.fn('DATE', sequelize.col('created_at'))],
      order: [[sequelize.fn('DATE', sequelize.col('created_at')), 'ASC']],
      limit: 30
    });

    res.json({
      success: true,
      data: {
        order_count: orderCount || 0,
        total_revenue: revenueResult || 0,
        status_stats: statusStats,
        daily_trend: dailyTrend
      }
    });
  } catch (error) {
    logger.error('获取订单统计失败:', error);
    res.status(500).json({ success: false, message: '服务器内部错误' });
  }
});

// 创建订单
router.post('/', [
  body('items').isArray({ min: 1 }).withMessage('订单商品不能为空'),
  body('items.*.product_id').isInt({ min: 1 }).withMessage('商品ID无效'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('商品数量必须大于0'),
  body('shipping_address').trim().notEmpty().withMessage('收货地址不能为空'),
  body('receiver').trim().notEmpty().withMessage('收货人不能为空'),
  body('receiver_phone').trim().notEmpty().withMessage('收货人手机号不能为空'),
  body('payment_method').optional().isIn(Object.values(PaymentMethod)),
  body('note').optional().trim()
], async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    console.log('=== 开始创建订单 ===');
    console.log('请求体:', JSON.stringify(req.body, null, 2));
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      await transaction.rollback();
      console.log('验证失败:', errors.array());
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const userId = (req as any).user.id;
    const { items, shipping_address, receiver, receiver_phone, payment_method, note } = req.body;
    console.log('用户ID:', userId);
    console.log('商品列表:', items);

    // 检查商品库存并计算总金额
    let totalAmount = 0;
    const orderItems: any[] = [];

    for (const item of items) {
      const product = await Product.findByPk(item.product_id, { transaction });
      
      if (!product) {
        await transaction.rollback();
        return res.status(400).json({ 
          success: false, 
          message: `商品ID ${item.product_id} 不存在` 
        });
      }

      if (product.status === 0) {
        await transaction.rollback();
        return res.status(400).json({ 
          success: false, 
          message: `商品 ${product.name} 已下架` 
        });
      }

      if (!product.hasStock(item.quantity)) {
        await transaction.rollback();
        return res.status(400).json({ 
          success: false, 
          message: `商品 ${product.name} 库存不足，当前库存: ${product.stock}` 
        });
      }

      // 减少库存
      product.decreaseStock(item.quantity);
      await product.save({ transaction });

      const subtotal = product.price * item.quantity;
      totalAmount += subtotal;

      orderItems.push({
        product_id: product.id,
        product_name: product.name,
        product_image: product.main_image ? (product.main_image.length > 1000 ? '' : product.main_image) : '',
        price: product.price,
        quantity: item.quantity,
        subtotal
      });
    }

    // 创建订单
    const order = await Order.create({
      order_no: generateOrderNo(),
      user_id: userId,
      total_amount: totalAmount,
      discount_amount: 0,
      shipping_fee: totalAmount > 100 ? 0 : 10, // 满100免运费
      payment_method: payment_method || PaymentMethod.ALIPAY,
      payment_status: 0,
      status: OrderStatus.PENDING,
      shipping_address,
      receiver,
      receiver_phone,
      note
    }, { transaction });

    // 计算最终金额
    order.calculateFinalAmount();
    await order.save({ transaction });

    // 创建订单项
    for (const item of orderItems) {
      await OrderItem.create({
        order_id: order.id,
        ...item
      }, { transaction });
    }

    await transaction.commit();

    // 获取完整的订单信息
    const fullOrder = await Order.findByPk(order.id, {
      include: [{
        model: OrderItem,
        as: 'items',
        include: [{
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'main_image']
        }]
      }]
    });

    res.status(201).json({
      success: true,
      message: '订单创建成功',
      data: fullOrder
    });
  } catch (error) {
    await transaction.rollback();
    logger.error('创建订单失败:', error);
    console.error('创建订单详细错误:', error);
    res.status(500).json({ 
      success: false, 
      message: '服务器内部错误',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined 
    });
  }
});

// 获取订单详情
router.get('/:id', [
  param('id').isInt({ min: 1 }).toInt()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const userId = (req as any).user.id;
    const isAdmin = (req as any).user.role === 'admin';

    const where: any = { id: req.params.id };
    if (!isAdmin) {
      where.user_id = userId;
    }

    const order = await Order.findOne({
      where,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'email', 'phone']
        },
        {
          model: OrderItem,
          as: 'items',
          include: [{
            model: Product,
            as: 'product',
            attributes: ['id', 'name', 'main_image', 'description']
          }]
        }
      ]
    });

    if (!order) {
      return res.status(404).json({ success: false, message: '订单不存在或无权访问' });
    }

    res.json({ success: true, data: order });
  } catch (error) {
    logger.error('获取订单详情失败:', error);
    res.status(500).json({ success: false, message: '服务器内部错误' });
  }
});

// 更新订单状态（支付、发货、完成等）
router.patch('/:id/status', [
  param('id').isInt({ min: 1 }).toInt(),
  body('status').isIn(Object.values(OrderStatus)).withMessage('订单状态无效'),
  body('action_note').optional().trim()
], async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      await transaction.rollback();
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const orderId = req.params.id;
    const { status, action_note } = req.body;
    const userId = (req as any).user.id;
    const isAdmin = (req as any).user.role === 'admin';

    const where: any = { id: orderId };
    if (!isAdmin) {
      where.user_id = userId;
    }

    const order = await Order.findOne({ where, transaction });
    if (!order) {
      await transaction.rollback();
      return res.status(404).json({ success: false, message: '订单不存在或无权访问' });
    }

    // 验证状态转换
    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.PENDING]: [OrderStatus.PAID, OrderStatus.CANCELLED],
      [OrderStatus.PAID]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED, OrderStatus.REFUNDED],
      [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED, OrderStatus.CANCELLED],
      [OrderStatus.DELIVERED]: [OrderStatus.COMPLETED],
      [OrderStatus.COMPLETED]: [],
      [OrderStatus.CANCELLED]: [],
      [OrderStatus.REFUNDED]: []
    };

    if (!validTransitions[order.status].includes(status)) {
      await transaction.rollback();
      return res.status(400).json({ 
        success: false, 
        message: `无法从 ${order.status} 状态转换为 ${status} 状态` 
      });
    }

    // 更新订单状态
    order.status = status;
    
    // 设置相应的时间戳
    const now = new Date();
    switch (status) {
      case OrderStatus.PAID:
        order.paid_at = now;
        order.payment_status = 1;
        break;
      case OrderStatus.SHIPPED:
        order.shipped_at = now;
        break;
      case OrderStatus.DELIVERED:
        order.delivered_at = now;
        break;
      case OrderStatus.COMPLETED:
        order.completed_at = now;
        break;
      case OrderStatus.CANCELLED:
        order.cancelled_at = now;
        // 取消订单时恢复库存
        if (order.status === OrderStatus.PAID || order.status === OrderStatus.PENDING) {
          const items = await OrderItem.findAll({
            where: { order_id: order.id },
            include: [Product]
          });
          
          for (const item of items) {
            if (item.product) {
              item.product.increaseStock(item.quantity);
              await item.product.save({ transaction });
            }
          }
        }
        break;
    }

    await order.save({ transaction });

    // 记录操作日志（实际项目中可以单独建表）
    if (action_note) {
      logger.info(`订单 ${order.order_no} 状态更新: ${order.status} -> ${status}`, {
        order_id: order.id,
        user_id: userId,
        action_note
      });
    }

    await transaction.commit();

    res.json({
      success: true,
      message: '订单状态更新成功',
      data: order
    });
  } catch (error) {
    await transaction.rollback();
    logger.error('更新订单状态失败:', error);
    res.status(500).json({ success: false, message: '服务器内部错误' });
  }
});

// 删除订单（软删除，仅管理员）
router.delete('/:id', [
  adminMiddleware,
  param('id').isInt({ min: 1 }).toInt()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const order = await Order.findByPk(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: '订单不存在' });
    }

    // 检查订单状态，只有已取消或已退款的订单可以删除
    if (order.status !== OrderStatus.CANCELLED && order.status !== OrderStatus.REFUNDED) {
      return res.status(400).json({ 
        success: false, 
        message: '只能删除已取消或已退款的订单' 
      });
    }

    await order.destroy();

    res.json({
      success: true,
      message: '订单删除成功'
    });
  } catch (error) {
    logger.error('删除订单失败:', error);
    res.status(500).json({ success: false, message: '服务器内部错误' });
  }
});

// 获取用户的订单统计
router.get('/user/stats', async (req, res) => {
  try {
    const userId = (req as any).user.id;

    const stats = await Order.findAll({
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('final_amount')), 'amount']
      ],
      where: { user_id: userId },
      group: ['status']
    });

    const totalOrders = await Order.count({ where: { user_id: userId } });
    const totalSpent = await Order.sum('final_amount', { 
      where: { 
        user_id: userId,
        status: OrderStatus.COMPLETED 
      } 
    });

    res.json({
      success: true,
      data: {
        total_orders: totalOrders || 0,
        total_spent: totalSpent || 0,
        status_stats: stats
      }
    });
  } catch (error) {
    logger.error('获取用户订单统计失败:', error);
    res.status(500).json({ success: false, message: '服务器内部错误' });
  }
});

// 取消订单（用户）
router.post('/:id/cancel', [
  param('id').isInt({ min: 1 }).toInt()
], async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      await transaction.rollback();
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const orderId = req.params.id;
    const userId = (req as any).user.id;

    const order = await Order.findOne({
      where: { id: orderId, user_id: userId },
      include: [{ model: OrderItem, as: 'items' }]
    });

    if (!order) {
      await transaction.rollback();
      return res.status(404).json({ success: false, message: '订单不存在' });
    }

    if (!order.canCancel()) {
      await transaction.rollback();
      return res.status(400).json({ 
        success: false, 
        message: '该订单无法取消，当前状态：' + order.status 
      });
    }

    // 更新订单状态
    order.status = OrderStatus.CANCELLED;
    order.cancelled_at = new Date();
    await order.save({ transaction });

    // 恢复库存
    for (const item of order.items) {
      const product = await Product.findByPk(item.product_id, { transaction });
      if (product) {
        product.increaseStock(item.quantity);
        await product.save({ transaction });
      }
    }

    await transaction.commit();

    res.json({
      success: true,
      message: '订单取消成功',
      data: order
    });
  } catch (error) {
    await transaction.rollback();
    logger.error('取消订单失败:', error);
    res.status(500).json({ success: false, message: '服务器内部错误' });
  }
});

// 编辑订单（修改地址、备注等）
router.put('/:id', [
  param('id').isInt({ min: 1 }).toInt(),
  body('shipping_address').optional().trim().notEmpty(),
  body('receiver').optional().trim().notEmpty(),
  body('receiver_phone').optional().trim().notEmpty(),
  body('note').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const orderId = req.params.id;
    const userId = (req as any).user.id;
    const isAdmin = (req as any).user.role === 'admin';

    const where: any = { id: orderId };
    if (!isAdmin) {
      where.user_id = userId;
    }

    const order = await Order.findOne({ where });
    if (!order) {
      return res.status(404).json({ success: false, message: '订单不存在或无权访问' });
    }

    // 只有待支付状态的订单可以编辑收货信息
    if (order.status !== OrderStatus.PENDING && !isAdmin) {
      return res.status(400).json({ 
        success: false, 
        message: '该订单无法编辑，当前状态：' + order.status 
      });
    }

    const { shipping_address, receiver, receiver_phone, note } = req.body;

    // 更新订单信息
    if (shipping_address) order.shipping_address = shipping_address;
    if (receiver) order.receiver = receiver;
    if (receiver_phone) order.receiver_phone = receiver_phone;
    if (note !== undefined) order.note = note;

    await order.save();

    res.json({
      success: true,
      message: '订单信息更新成功',
      data: order
    });
  } catch (error) {
    logger.error('编辑订单失败:', error);
    res.status(500).json({ success: false, message: '服务器内部错误' });
  }
});

export default router;