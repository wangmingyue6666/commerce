/**
 * 订单管理模块测试用例
 * 测试功能：购物车、订单创建、订单详情、订单编辑、订单取消、订单删除
 */

const BASE_URL = 'http://localhost:3000/api';

// 测试用户凭证
const TEST_USER = {
  username: 'user1',
  password: 'password123'
};

let token = '';
let orderId = '';

async function test(step, fn) {
  try {
    console.log(`\n${step}`);
    await fn();
    console.log(`✓ ${step} - 成功`);
    return true;
  } catch (error) {
    console.error(`✗ ${step} - 失败:`, error.message || error);
    return false;
  }
}

async function request(url, options = {}) {
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    },
    ...options
  };
  
  const response = await fetch(`${BASE_URL}${url}`, defaultOptions);
  const data = await response.json();
  
  if (!data.success && response.status !== 200) {
    throw new Error(data.message || '请求失败');
  }
  
  return data;
}

async function runTests() {
  console.log('=== 订单管理模块功能测试 ===\n');

  // 1. 用户登录
  const loginSuccess = await test('1. 用户登录', async () => {
    const result = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(TEST_USER)
    });
    token = result.data.token;
    if (!token) throw new Error('未获取到token');
    console.log(`   用户ID: ${result.data.user.id}, 用户名: ${result.data.user.username}`);
  });

  if (!loginSuccess) return;

  // 2. 获取商品列表
  await test('2. 获取商品列表', async () => {
    const result = await request('/products?limit=5');
    console.log(`   找到 ${result.data.length} 个商品`);
    console.log(`   商品ID列表: ${result.data.map(p => p.id).join(', ')}`);
  });

  // 3. 添加商品到购物车
  await test('3. 添加商品到购物车', async () => {
    const products = (await request('/products?limit=1')).data;
    if (products.length === 0) throw new Error('没有商品可添加');
    
    await request('/cart', {
      method: 'POST',
      body: JSON.stringify({
        product_id: products[0].id,
        quantity: 2
      })
    });
  });

  // 4. 查看购物车
  await test('4. 查看购物车', async () => {
    const result = await request('/cart');
    console.log(`   购物车中有 ${result.data.length} 个商品`);
    result.data.forEach(item => {
      console.log(`   - ${item.product_name || '未知商品'} x ${item.quantity} = ¥${((item.price || 0) * (item.quantity || 0)).toFixed(2)}`);
    });
  });

  // 5. 创建订单
  const createSuccess = await test('5. 创建订单', async () => {
    const products = (await request('/products?limit=1')).data;
    if (products.length === 0) throw new Error('没有商品可下单');
    
    const result = await request('/orders', {
      method: 'POST',
      body: JSON.stringify({
        items: [{ product_id: products[0].id, quantity: 1 }],
        shipping_address: '北京市朝阳区测试地址123号',
        receiver: '张三',
        receiver_phone: '13800138000',
        note: '测试订单，请尽快发货'
      })
    });
    
    orderId = result.data.id;
    console.log(`   订单ID: ${orderId}`);
    console.log(`   订单号: ${result.data.order_no}`);
    console.log(`   订单金额: ¥${Number(result.data.total_amount || 0).toFixed(2)}`);
  });

  if (!createSuccess) return;

  // 6. 查看订单列表
  await test('6. 查看订单列表', async () => {
    const result = await request('/orders');
    console.log(`   当前有 ${result.data.length} 个订单`);
    result.data.forEach(order => {
      console.log(`   - 订单号: ${order.order_no}, 状态: ${order.status}, 金额: ¥${Number(order.total_amount || 0).toFixed(2)}`);
    });
  });

  // 7. 查看订单详情
  await test('7. 查看订单详情', async () => {
    const result = await request(`/orders/${orderId}`);
    const order = result.data;
    console.log(`   订单号: ${order.order_no}`);
    console.log(`   状态: ${order.status}`);
    console.log(`   收货人: ${order.receiver} ${order.receiver_phone}`);
    console.log(`   地址: ${order.shipping_address}`);
    console.log(`   商品数量: ${order.items?.length || 0}`);
    console.log(`   总金额: ¥${Number(order.total_amount || 0).toFixed(2)}`);
  });

  // 8. 编辑订单
  await test('8. 编辑订单信息', async () => {
    await request(`/orders/${orderId}`, {
      method: 'PUT',
      body: JSON.stringify({
        shipping_address: '北京市海淀区新地址456号',
        receiver: '李四',
        receiver_phone: '13900139000',
        note: '修改后的备注信息'
      })
    });
    
    // 验证修改
    const result = await request(`/orders/${orderId}`);
    if (result.data.receiver !== '李四') throw new Error('订单编辑失败');
    console.log(`   收货人已更新为: ${result.data.receiver}`);
  });

  // 9. 取消订单
  await test('9. 取消订单', async () => {
    await request(`/orders/${orderId}/cancel`, {
      method: 'POST'
    });
    
    // 验证状态
    const result = await request(`/orders/${orderId}`);
    if (result.data.status !== 'cancelled') throw new Error('订单取消失败');
    console.log(`   订单状态已更新为: ${result.data.status}`);
  });

  // 10. 删除订单（需要管理员权限）
  await test('10. 管理员删除订单', async () => {
    // 先用管理员登录
    const adminResult = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username: 'admin', password: 'password123' })
    });
    const adminToken = adminResult.data.token;
    
    const response = await fetch(`${BASE_URL}/orders/${orderId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      }
    });
    
    const data = await response.json();
    if (!data.success) throw new Error(data.message || '删除失败');
    console.log('   订单已成功删除');
  });

  console.log('\n=== 测试完成 ===');
}

runTests().catch(console.error);
