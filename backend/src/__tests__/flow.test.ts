import request from 'supertest';
import app from '../app';
import { Order, OrderItem } from '../models/order.model';
import sequelize from '../config/database';

function printSection(title: string) {
  console.log('\n' + '='.repeat(70));
  console.log(`  ${title}`);
  console.log('='.repeat(70));
}

function printStep(step: number, name: string) {
  console.log(`\n📋 步骤 ${step}: ${name}`);
}

function printResult(passed: boolean, message?: string) {
  if (passed) {
    console.log(`  ✅ 通过 ${message || ''}`);
  } else {
    console.log(`  ❌ 失败 ${message || ''}`);
  }
}

describe('订单管理主流程测试', () => {
  let token: string;
  let createdOrderId: number;
  let cartItemId: number;

  afterAll(async () => {
    await sequelize.close();
  });

  printSection('📝 订单管理主流程测试 - 使用admin账号');

  describe('流程测试', () => {
    it('1. 用户登录', async () => {
      printStep(1, '用户登录 (admin/password123)');
      
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'admin',
          password: 'password123'
        });

      console.log('  响应状态:', response.status);
      console.log('  响应数据:', JSON.stringify(response.body, null, 2));

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('token');
      
      token = response.body.data.token;
      printResult(true, `获取Token成功`);
    });

    it('2. 获取商品列表', async () => {
      printStep(2, '获取商品列表');
      
      const response = await request(app)
        .get('/api/products?limit=5')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      
      printResult(true, `获取到 ${response.body.data.length} 件商品`);
    });

    it('3. 添加商品到购物车', async () => {
      printStep(3, '添加商品到购物车');
      
      const response = await request(app)
        .post('/api/cart')
        .set('Authorization', `Bearer ${token}`)
        .send({
          product_id: 7,
          quantity: 1
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      
      cartItemId = response.body.data.id;
      printResult(true, `添加成功，购物车项ID: ${cartItemId}`);
    });

    it('4. 查看购物车', async () => {
      printStep(4, '查看购物车');
      
      const response = await request(app)
        .get('/api/cart')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      
      printResult(true, `购物车中有 ${response.body.data.length} 件商品`);
    });

    it('5. 创建订单', async () => {
      printStep(5, '创建订单');
      
      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${token}`)
        .send({
          items: [{ product_id: 7, quantity: 1 }],
          shipping_address: '北京市朝阳区测试路123号',
          receiver: '张三',
          receiver_phone: '13800138000',
          payment_method: 'alipay',
          note: '主流程测试订单'
        });

      console.log('  响应状态:', response.status);
      console.log('  响应数据:', JSON.stringify(response.body, null, 2));

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('order_no');
      expect(response.body.data.status).toBe('pending');
      
      createdOrderId = response.body.data.id;
      printResult(true, `订单创建成功，订单ID: ${createdOrderId}, 订单号: ${response.body.data.order_no}`);
    });

    it('6. 查看订单列表', async () => {
      printStep(6, '查看订单列表');
      
      const response = await request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      
      printResult(true, `共 ${response.body.data.length} 条订单`);
    });

    it('7. 查看订单详情', async () => {
      printStep(7, '查看订单详情');
      
      const response = await request(app)
        .get(`/api/orders/${createdOrderId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(createdOrderId);
      expect(response.body.data).toHaveProperty('items');
      
      printResult(true, `订单详情获取成功`);
    });

    it('8. 更新订单状态为已支付', async () => {
      printStep(8, '更新订单状态为已支付');
      
      const response = await request(app)
        .patch(`/api/orders/${createdOrderId}/status`)
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'paid' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('paid');
      
      printResult(true, '订单状态更新为已支付');
    });

    it('9. 更新订单状态为已发货', async () => {
      printStep(9, '更新订单状态为已发货');
      
      const response = await request(app)
        .patch(`/api/orders/${createdOrderId}/status`)
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'shipped' });

      expect(response.status).toBe(200);
      expect(response.body.data.status).toBe('shipped');
      
      printResult(true, '订单状态更新为已发货');
    });

    it('10. 更新订单状态为已送达', async () => {
      printStep(10, '更新订单状态为已送达');
      
      const response = await request(app)
        .patch(`/api/orders/${createdOrderId}/status`)
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'delivered' });

      expect(response.status).toBe(200);
      expect(response.body.data.status).toBe('delivered');
      
      printResult(true, '订单状态更新为已送达');
    });

    it('11. 更新订单状态为已完成', async () => {
      printStep(11, '更新订单状态为已完成');
      
      const response = await request(app)
        .patch(`/api/orders/${createdOrderId}/status`)
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'completed' });

      expect(response.status).toBe(200);
      expect(response.body.data.status).toBe('completed');
      
      printResult(true, '订单状态更新为已完成');
    });

    it('12. 获取订单统计', async () => {
      printStep(12, '获取订单统计');
      
      const response = await request(app)
        .get('/api/orders/stats')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('order_count');
      expect(response.body.data).toHaveProperty('total_revenue');
      expect(response.body.data).toHaveProperty('status_stats');
      
      printResult(true, `订单总数: ${response.body.data.order_count}, 总收入: ¥${response.body.data.total_revenue}`);
    });

    it('13. 获取用户订单统计', async () => {
      printStep(13, '获取当前用户订单统计');
      
      const response = await request(app)
        .get('/api/orders/user/stats')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('total_orders');
      expect(response.body.data).toHaveProperty('total_spent');
      
      printResult(true, `用户订单数: ${response.body.data.total_orders}, 消费总额: ¥${response.body.data.total_spent}`);
    });

    it('14. 退出登录', async () => {
      printStep(14, '退出登录');
      
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      
      printResult(true, '退出登录成功');
    });
  });

  printSection('🎉 主流程测试完成');
  console.log('\n所有测试步骤已完成，请查看上述结果。\n');
});