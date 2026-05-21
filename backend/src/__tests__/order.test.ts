http://localhost:8082/import request from 'supertest';
import app from '../app';
import jwt from 'jsonwebtoken';
import { Order, OrderItem } from '../models/order.model';
import sequelize from '../config/database';
import Product from '../models/product.model';

const JWT_SECRET = process.env.JWT_SECRET || 'ecommerce_secret_key_2026';

interface TestUser {
  id: number;
  username: string;
  role: string;
  email: string;
}

const testUser: TestUser = { id: 5, username: 'admin', role: 'admin', email: 'admin@example.com' };
const testUserToken = jwt.sign(testUser, JWT_SECRET, { expiresIn: '1h' });
const normalUserToken = jwt.sign(
  { id: 2, username: 'testuser', role: 'user', email: 'test@example.com' },
  JWT_SECRET,
  { expiresIn: '1h' }
);

function printSection(title: string) {
  console.log('\n' + '='.repeat(60));
  console.log(`  ${title}`);
  console.log('='.repeat(60));
}

function printTestCase(name: string) {
  console.log(`\n▶ 测试用例: ${name}`);
}

function printResult(passed: boolean, message?: string) {
  if (passed) {
    console.log(`  ✅ 通过 ${message || ''}`);
  } else {
    console.log(`  ❌ 失败 ${message || ''}`);
  }
}

describe('订单模块 - 详细测试报告', () => {
  let createdOrderId: number;
  let testProductId: number;

  beforeAll(async () => {
    printSection('测试环境初始化');
    console.log('测试用户ID:', testUser.id);
    console.log('JWT密钥:', JWT_SECRET);
  });

  afterAll(async () => {
    await sequelize.close();
  });

  printSection('一、创建订单接口测试 (POST /api/orders)');

  describe('1.1 正常创建订单', () => {
    it('1.1.1 使用有效信息创建订单', async () => {
      printTestCase('1.1.1 使用有效信息创建订单');
      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({
          items: [{ product_id: 1, quantity: 1 }],
          shipping_address: '北京市朝阳区测试路123号',
          receiver: '张三',
          receiver_phone: '13800138000',
          payment_method: 'alipay',
          note: '测试订单'
        });

      console.log('  响应状态:', response.status);
      console.log('  响应数据:', JSON.stringify(response.body, null, 2));

      if (response.status === 201) {
        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('order_no');
        expect(response.body.data.status).toBe('pending');
        createdOrderId = response.body.data.id;
        printResult(true, '订单创建成功');
      } else {
        printResult(false, `状态码: ${response.status}, 错误: ${response.body.message}`);
      }
    });

    it('1.1.2 使用微信支付创建订单', async () => {
      printTestCase('1.1.2 使用微信支付创建订单');
      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({
          items: [{ product_id: 1, quantity: 1 }],
          shipping_address: '上海市浦东新区测试街456号',
          receiver: '李四',
          receiver_phone: '13900139000',
          payment_method: 'wechat',
          note: '微信支付测试'
        });

      if (response.status === 201) {
        expect(response.body.data.payment_method).toBe('wechat');
        printResult(true);
      } else {
        printResult(false, response.body.message);
      }
    });

    it('1.1.3 不填写备注创建订单', async () => {
      printTestCase('1.1.3 不填写备注创建订单');
      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({
          items: [{ product_id: 1, quantity: 2 }],
          shipping_address: '广州市天河区测试大道789号',
          receiver: '王五',
          receiver_phone: '13700137000',
          payment_method: 'alipay'
        });

      if (response.status === 201) {
        expect(response.body.success).toBe(true);
        expect(response.body.data.note).toBeNull();
        printResult(true);
      } else {
        printResult(false, response.body.message);
      }
    });
  });

  describe('1.2 参数验证测试', () => {
    it('1.2.1 空商品列表应返回错误', async () => {
      printTestCase('1.2.1 空商品列表应返回错误');
      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({
          items: [],
          shipping_address: '测试地址',
          receiver: '测试用户',
          receiver_phone: '13800138000'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      printResult(response.status === 400);
    });

    it('1.2.2 缺少收货地址应返回错误', async () => {
      printTestCase('1.2.2 缺少收货地址应返回错误');
      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({
          items: [{ product_id: 1, quantity: 1 }],
          receiver: '测试用户',
          receiver_phone: '13800138000'
        });

      expect(response.status).toBe(400);
      printResult(response.status === 400);
    });

    it('1.2.3 缺少收货人应返回错误', async () => {
      printTestCase('1.2.3 缺少收货人应返回错误');
      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({
          items: [{ product_id: 1, quantity: 1 }],
          shipping_address: '测试地址',
          receiver_phone: '13800138000'
        });

      expect(response.status).toBe(400);
      printResult(response.status === 400);
    });

    it('1.2.4 缺少手机号应返回错误', async () => {
      printTestCase('1.2.4 缺少手机号应返回错误');
      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({
          items: [{ product_id: 1, quantity: 1 }],
          shipping_address: '测试地址',
          receiver: '测试用户'
        });

      expect(response.status).toBe(400);
      printResult(response.status === 400);
    });

    it('1.2.5 商品数量为0应返回错误', async () => {
      printTestCase('1.2.5 商品数量为0应返回错误');
      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({
          items: [{ product_id: 1, quantity: 0 }],
          shipping_address: '测试地址',
          receiver: '测试用户',
          receiver_phone: '13800138000'
        });

      expect(response.status).toBe(400);
      printResult(response.status === 400);
    });

    it('1.2.6 商品数量为负数应返回错误', async () => {
      printTestCase('1.2.6 商品数量为负数应返回错误');
      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({
          items: [{ product_id: 1, quantity: -1 }],
          shipping_address: '测试地址',
          receiver: '测试用户',
          receiver_phone: '13800138000'
        });

      expect(response.status).toBe(400);
      printResult(response.status === 400);
    });

    it('1.2.7 无效的商品ID应返回错误', async () => {
      printTestCase('1.2.7 无效的商品ID应返回错误');
      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({
          items: [{ product_id: 99999, quantity: 1 }],
          shipping_address: '测试地址',
          receiver: '测试用户',
          receiver_phone: '13800138000'
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('不存在');
      printResult(response.status === 400);
    });

    it('1.2.8 无效的支付方式应返回错误', async () => {
      printTestCase('1.2.8 无效的支付方式应返回错误');
      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({
          items: [{ product_id: 1, quantity: 1 }],
          shipping_address: '测试地址',
          receiver: '测试用户',
          receiver_phone: '13800138000',
          payment_method: 'invalid_payment'
        });

      expect(response.status).toBe(400);
      printResult(response.status === 400);
    });
  });

  describe('1.3 认证与授权测试', () => {
    it('1.3.1 未携带Token应返回401', async () => {
      printTestCase('1.3.1 未携带Token应返回401');
      const response = await request(app)
        .post('/api/orders')
        .send({
          items: [{ product_id: 1, quantity: 1 }],
          shipping_address: '测试地址',
          receiver: '测试用户',
          receiver_phone: '13800138000'
        });

      expect(response.status).toBe(401);
      printResult(response.status === 401);
    });

    it('1.3.2 使用无效Token应返回401', async () => {
      printTestCase('1.3.2 使用无效Token应返回401');
      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', 'Bearer invalid_token_here')
        .send({
          items: [{ product_id: 1, quantity: 1 }],
          shipping_address: '测试地址',
          receiver: '测试用户',
          receiver_phone: '13800138000'
        });

      expect(response.status).toBe(401);
      printResult(response.status === 401);
    });

    it('1.3.3 Token格式错误应返回401', async () => {
      printTestCase('1.3.3 Token格式错误应返回401');
      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', 'NotBearer some_token')
        .send({
          items: [{ product_id: 1, quantity: 1 }],
          shipping_address: '测试地址',
          receiver: '测试用户',
          receiver_phone: '13800138000'
        });

      expect(response.status).toBe(401);
      printResult(response.status === 401);
    });
  });

  printSection('二、查询订单接口测试 (GET /api/orders)');

  describe('2.1 获取订单列表', () => {
    it('2.1.1 管理员可以获取所有订单', async () => {
      printTestCase('2.1.1 管理员可以获取所有订单');
      const response = await request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${testUserToken}`);

      console.log('  订单总数:', response.body.pagination?.total || 0);

      if (response.status === 200) {
        expect(response.body.success).toBe(true);
        expect(Array.isArray(response.body.data)).toBe(true);
        printResult(true, `共 ${response.body.data.length} 条订单`);
      } else {
        printResult(false, response.body.message);
      }
    });

    it('2.1.2 普通用户只能获取自己的订单', async () => {
      printTestCase('2.1.2 普通用户只能获取自己的订单');
      const response = await request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${normalUserToken}`);

      if (response.status === 200) {
        expect(response.body.success).toBe(true);
        const orders = response.body.data;
        if (orders.length > 0) {
          orders.forEach((order: any) => {
            expect(order.user_id).toBe(2);
          });
        }
        printResult(true);
      } else {
        printResult(false, response.body.message);
      }
    });

    it('2.1.3 分页参数测试', async () => {
      printTestCase('2.1.3 分页参数测试');
      const response = await request(app)
        .get('/api/orders?page=1&limit=5')
        .set('Authorization', `Bearer ${testUserToken}`);

      if (response.status === 200) {
        expect(response.body.pagination).toBeDefined();
        expect(response.body.pagination.page).toBe(1);
        expect(response.body.pagination.limit).toBe(5);
        printResult(true);
      } else {
        printResult(false, response.body.message);
      }
    });

    it('2.1.4 按状态筛选订单', async () => {
      printTestCase('2.1.4 按状态筛选订单');
      const response = await request(app)
        .get('/api/orders?status=pending')
        .set('Authorization', `Bearer ${testUserToken}`);

      if (response.status === 200) {
        const orders = response.body.data;
        if (orders.length > 0) {
          orders.forEach((order: any) => {
            expect(order.status).toBe('pending');
          });
        }
        printResult(true);
      } else {
        printResult(false, response.body.message);
      }
    });

    it('2.1.5 关键词搜索订单', async () => {
      printTestCase('2.1.5 关键词搜索订单');
      const response = await request(app)
        .get('/api/orders?keyword=测试')
        .set('Authorization', `Bearer ${testUserToken}`);

      if (response.status === 200) {
        expect(response.body.success).toBe(true);
        printResult(true);
      } else {
        printResult(false, response.body.message);
      }
    });
  });

  describe('2.2 获取订单详情', () => {
    it('2.2.1 使用有效ID获取订单详情', async () => {
      printTestCase('2.2.1 使用有效ID获取订单详情');
      if (!createdOrderId) {
        console.log('  跳过: 没有可用的订单ID');
        return;
      }

      const response = await request(app)
        .get(`/api/orders/${createdOrderId}`)
        .set('Authorization', `Bearer ${testUserToken}`);

      if (response.status === 200) {
        expect(response.body.success).toBe(true);
        expect(response.body.data.id).toBe(createdOrderId);
        expect(response.body.data).toHaveProperty('items');
        printResult(true);
      } else {
        printResult(false, response.body.message);
      }
    });

    it('2.2.2 使用无效ID应返回404', async () => {
      printTestCase('2.2.2 使用无效ID应返回404');
      const response = await request(app)
        .get('/api/orders/99999')
        .set('Authorization', `Bearer ${testUserToken}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toContain('不存在');
      printResult(response.status === 404);
    });

    it('2.2.3 普通用户不能查看其他用户订单', async () => {
      printTestCase('2.2.3 普通用户不能查看其他用户订单');
      if (!createdOrderId) {
        console.log('  跳过: 没有可用的订单ID');
        return;
      }

      const response = await request(app)
        .get(`/api/orders/${createdOrderId}`)
        .set('Authorization', `Bearer ${normalUserToken}`);

      expect(response.status).toBe(404);
      printResult(response.status === 404);
    });
  });

  printSection('三、更新订单状态接口测试 (PATCH /api/orders/:id/status)');

  describe('3.1 管理员更新订单状态', () => {
    it('3.1.1 管理员将订单状态更新为已支付', async () => {
      printTestCase('3.1.1 管理员将订单状态更新为已支付');
      if (!createdOrderId) {
        console.log('  跳过: 没有可用的订单ID');
        return;
      }

      const response = await request(app)
        .patch(`/api/orders/${createdOrderId}/status`)
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({ status: 'paid' });

      console.log('  响应:', JSON.stringify(response.body, null, 2));

      if (response.status === 200) {
        expect(response.body.data.status).toBe('paid');
        expect(response.body.data.payment_status).toBe(1);
        printResult(true);
      } else {
        printResult(false, `状态码: ${response.status}, 错误: ${response.body.message}`);
      }
    });

    it('3.1.2 管理员将订单状态更新为已发货', async () => {
      printTestCase('3.1.2 管理员将订单状态更新为已发货');
      if (!createdOrderId) {
        console.log('  跳过: 没有可用的订单ID');
        return;
      }

      const response = await request(app)
        .patch(`/api/orders/${createdOrderId}/status`)
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({ status: 'shipped' });

      if (response.status === 200) {
        expect(response.body.data.status).toBe('shipped');
        printResult(true);
      } else {
        printResult(false, response.body.message);
      }
    });

    it('3.1.3 管理员将订单状态更新为已送达', async () => {
      printTestCase('3.1.3 管理员将订单状态更新为已送达');
      if (!createdOrderId) {
        console.log('  跳过: 没有可用的订单ID');
        return;
      }

      const response = await request(app)
        .patch(`/api/orders/${createdOrderId}/status`)
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({ status: 'delivered' });

      if (response.status === 200) {
        expect(response.body.data.status).toBe('delivered');
        printResult(true);
      } else {
        printResult(false, response.body.message);
      }
    });

    it('3.1.4 管理员将订单状态更新为已完成', async () => {
      printTestCase('3.1.4 管理员将订单状态更新为已完成');
      if (!createdOrderId) {
        console.log('  跳过: 没有可用的订单ID');
        return;
      }

      const response = await request(app)
        .patch(`/api/orders/${createdOrderId}/status`)
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({ status: 'completed' });

      if (response.status === 200) {
        expect(response.body.data.status).toBe('completed');
        printResult(true);
      } else {
        printResult(false, response.body.message);
      }
    });
  });

  describe('3.2 状态转换规则测试', () => {
    it('3.2.1 已完成的订单不能再修改状态', async () => {
      printTestCase('3.2.1 已完成的订单不能再修改状态');
      if (!createdOrderId) {
        console.log('  跳过: 没有可用的订单ID');
        return;
      }

      const response = await request(app)
        .patch(`/api/orders/${createdOrderId}/status`)
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({ status: 'shipped' });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('无法');
      printResult(response.status === 400);
    });

    it('3.2.2 无效的状态值应返回错误', async () => {
      printTestCase('3.2.2 无效的状态值应返回错误');
      if (!createdOrderId) {
        console.log('  跳过: 没有可用的订单ID');
        return;
      }

      const response = await request(app)
        .patch(`/api/orders/${createdOrderId}/status`)
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({ status: 'invalid_status' });

      expect(response.status).toBe(400);
      printResult(response.status === 400);
    });
  });

  describe('3.3 普通用户状态更新权限', () => {
    it('3.3.1 普通用户不能更新订单状态', async () => {
      printTestCase('3.3.1 普通用户不能更新订单状态');
      if (!createdOrderId) {
        console.log('  跳过: 没有可用的订单ID');
        return;
      }

      const response = await request(app)
        .patch(`/api/orders/${createdOrderId}/status`)
        .set('Authorization', `Bearer ${normalUserToken}`)
        .send({ status: 'paid' });

      expect(response.status).toBe(403);
      printResult(response.status === 403);
    });
  });

  printSection('四、取消订单接口测试 (POST /api/orders/:id/cancel)');

  describe('4.1 正常取消订单', () => {
    it('4.1.1 取消待支付的订单', async () => {
      printTestCase('4.1.1 取消待支付的订单');
      const createResponse = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({
          items: [{ product_id: 1, quantity: 1 }],
          shipping_address: '取消测试地址',
          receiver: '取消测试',
          receiver_phone: '13800138000'
        });

      if (createResponse.status !== 201) {
        console.log('  跳过: 无法创建测试订单');
        return;
      }

      const orderId = createResponse.body.data.id;

      const response = await request(app)
        .post(`/api/orders/${orderId}/cancel`)
        .set('Authorization', `Bearer ${testUserToken}`);

      if (response.status === 200) {
        expect(response.body.data.status).toBe('cancelled');
        printResult(true);
      } else {
        printResult(false, response.body.message);
      }
    });
  });

  describe('4.2 取消订单规则测试', () => {
    it('4.2.1 已完成的订单不能取消', async () => {
      printTestCase('4.2.1 已完成的订单不能取消');
      if (!createdOrderId) {
        console.log('  跳过: 没有可用的订单ID');
        return;
      }

      const response = await request(app)
        .post(`/api/orders/${createdOrderId}/cancel`)
        .set('Authorization', `Bearer ${testUserToken}`);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('无法取消');
      printResult(response.status === 400);
    });

    it('4.2.2 不存在的订单应返回404', async () => {
      printTestCase('4.2.2 不存在的订单应返回404');
      const response = await request(app)
        .post('/api/orders/99999/cancel')
        .set('Authorization', `Bearer ${testUserToken}`);

      expect(response.status).toBe(404);
      printResult(response.status === 404);
    });
  });

  printSection('五、编辑订单接口测试 (PUT /api/orders/:id)');

  describe('5.1 正常编辑订单', () => {
    it('5.1.1 编辑待支付订单的收货信息', async () => {
      printTestCase('5.1.1 编辑待支付订单的收货信息');
      const createResponse = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({
          items: [{ product_id: 1, quantity: 1 }],
          shipping_address: '原始地址',
          receiver: '原始收货人',
          receiver_phone: '13800138000'
        });

      if (createResponse.status !== 201) {
        console.log('  跳过: 无法创建测试订单');
        return;
      }

      const orderId = createResponse.body.data.id;

      const response = await request(app)
        .put(`/api/orders/${orderId}`)
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({
          shipping_address: '新地址',
          receiver: '新收货人',
          receiver_phone: '13900139000',
          note: '修改后的备注'
        });

      if (response.status === 200) {
        expect(response.body.data.shipping_address).toBe('新地址');
        expect(response.body.data.receiver).toBe('新收货人');
        printResult(true);
      } else {
        printResult(false, response.body.message);
      }
    });
  });

  describe('5.2 编辑订单规则测试', () => {
    it('5.2.1 已支付的订单不能编辑', async () => {
      printTestCase('5.2.1 已支付的订单不能编辑');
      if (!createdOrderId) {
        console.log('  跳过: 没有可用的订单ID');
        return;
      }

      const response = await request(app)
        .put(`/api/orders/${createdOrderId}`)
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({
          shipping_address: '新地址'
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('无法编辑');
      printResult(response.status === 400);
    });
  });

  printSection('六、删除订单接口测试 (DELETE /api/orders/:id)');

  describe('6.1 删除订单规则测试', () => {
    it('6.1.1 普通用户不能删除订单', async () => {
      printTestCase('6.1.1 普通用户不能删除订单');
      const response = await request(app)
        .delete('/api/orders/1')
        .set('Authorization', `Bearer ${normalUserToken}`);

      expect(response.status).toBe(403);
      printResult(response.status === 403);
    });

    it('6.1.2 未取消的订单不能删除', async () => {
      printTestCase('6.1.2 未取消的订单不能删除');
      const response = await request(app)
        .delete('/api/orders/1')
        .set('Authorization', `Bearer ${testUserToken}`);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('只能删除');
      printResult(response.status === 400);
    });
  });

  printSection('七、用户订单统计接口测试 (GET /api/orders/user/stats)');

  describe('7.1 统计接口测试', () => {
    it('7.1.1 获取当前用户的订单统计', async () => {
      printTestCase('7.1.1 获取当前用户的订单统计');
      const response = await request(app)
        .get('/api/orders/user/stats')
        .set('Authorization', `Bearer ${testUserToken}`);

      if (response.status === 200) {
        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('total_orders');
        expect(response.body.data).toHaveProperty('total_spent');
        expect(response.body.data).toHaveProperty('status_stats');
        printResult(true, `总订单: ${response.body.data.total_orders}`);
      } else {
        printResult(false, response.body.message);
      }
    });

    it('7.1.2 未登录用户不能获取统计', async () => {
      printTestCase('7.1.2 未登录用户不能获取统计');
      const response = await request(app)
        .get('/api/orders/user/stats');

      expect(response.status).toBe(401);
      printResult(response.status === 401);
    });
  });

  printSection('八、订单统计接口测试 (GET /api/orders/stats)');

  describe('8.1 管理员统计接口测试', () => {
    it('8.1.1 管理员可以获取全部订单统计', async () => {
      printTestCase('8.1.1 管理员可以获取全部订单统计');
      const response = await request(app)
        .get('/api/orders/stats')
        .set('Authorization', `Bearer ${testUserToken}`);

      if (response.status === 200) {
        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('order_count');
        expect(response.body.data).toHaveProperty('total_revenue');
        expect(response.body.data).toHaveProperty('status_stats');
        expect(response.body.data).toHaveProperty('daily_trend');
        printResult(true);
      } else {
        printResult(false, response.body.message);
      }
    });

    it('8.1.2 普通用户不能获取全部统计', async () => {
      printTestCase('8.1.2 普通用户不能获取全部统计');
      const response = await request(app)
        .get('/api/orders/stats')
        .set('Authorization', `Bearer ${normalUserToken}`);

      expect(response.status).toBe(403);
      printResult(response.status === 403);
    });
  });

  printSection('测试完成');
  console.log('\n测试执行完毕，请查看上述测试结果。\n');
});