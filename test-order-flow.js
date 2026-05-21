const API_BASE = 'http://localhost:3000/api';

let authToken = '';
let testUserId = 0;
let testProductId = 0;
let testCartItemId = 0;
let testOrderId = 0;

const log = (step, message, data = null) => {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`【步骤${step}】${message}`);
  console.log('='.repeat(60));
  if (data) {
    console.log(JSON.stringify(data, null, 2));
  }
};

const request = async (path, options = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };
  
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers
  });

  const data = await response.json();
  return { status: response.status, data };
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const runTests = async () => {
  try {
    console.log('\n🚀 开始测试订单管理模块完整流程...\n');

    // 步骤1: 用户登录
    log(1, '用户登录');
    const loginRes = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        username: 'testuser',
        password: '123456'
      })
    });
    
    if (loginRes.data.success) {
      authToken = loginRes.data.data.token;
      testUserId = loginRes.data.data.user.id;
      log(1, '✅ 登录成功', { userId: testUserId, username: loginRes.data.data.user.username });
    } else {
      // 如果登录失败，尝试注册
      log(1, '⚠️ 登录失败，尝试注册新用户');
      const registerRes = await request('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          username: 'testuser',
          password: '123456',
          email: 'testuser@example.com',
          phone: '13800138000'
        })
      });
      
      if (registerRes.data.success) {
        authToken = registerRes.data.data.token;
        testUserId = registerRes.data.data.user.id;
        log(1, '✅ 注册并登录成功', { userId: testUserId });
      } else {
        throw new Error('注册失败: ' + JSON.stringify(registerRes.data));
      }
    }

    await sleep(500);

    // 步骤2: 获取商品列表
    log(2, '获取商品列表');
    const productsRes = await request('/products');
    
    console.log('商品API返回:', JSON.stringify(productsRes.data, null, 2));
    
    if (productsRes.data.success) {
      const products = productsRes.data.data?.products || productsRes.data.data || [];
      if (products.length > 0) {
        testProductId = products[0].id;
        log(2, '✅ 获取商品成功', { 
          productCount: products.length,
          firstProductId: testProductId,
          firstProductName: products[0].name,
          firstProductPrice: products[0].price,
          firstProductStock: products[0].stock
        });
      } else {
        throw new Error('商品列表为空');
      }
    } else {
      throw new Error('获取商品失败: ' + JSON.stringify(productsRes.data));
    }

    await sleep(500);

    // 步骤3: 添加商品到购物车
    log(3, '添加商品到购物车');
    const addToCartRes = await request('/cart', {
      method: 'POST',
      body: JSON.stringify({
        product_id: testProductId,
        quantity: 2
      })
    });
    
    if (addToCartRes.data.success) {
      testCartItemId = addToCartRes.data.data.id;
      log(3, '✅ 添加到购物车成功', addToCartRes.data.data);
    } else {
      throw new Error('添加到购物车失败: ' + JSON.stringify(addToCartRes.data));
    }

    await sleep(500);

    // 步骤4: 查看购物车
    log(4, '查看购物车');
    const cartRes = await request('/cart');
    
    if (cartRes.data.success) {
      log(4, '✅ 购物车列表', { 
        itemCount: cartRes.data.data.length,
        items: cartRes.data.data.map(item => ({
          id: item.id,
          productName: item.product?.name,
          quantity: item.quantity,
          price: item.product?.price
        }))
      });
    }

    await sleep(500);

    // 步骤5: 从购物车结算创建订单
    log(5, '从购物车结算创建订单');
    const createOrderRes = await request('/orders', {
      method: 'POST',
      body: JSON.stringify({
        items: [{ product_id: testProductId, quantity: 2 }],
        shipping_address: '北京市朝阳区测试路123号',
        receiver: '测试用户',
        receiver_phone: '13800138000',
        note: '请尽快发货，谢谢！'
      })
    });
    
    if (createOrderRes.data.success) {
      testOrderId = createOrderRes.data.data.id;
      log(5, '✅ 订单创建成功', {
        orderId: testOrderId,
        orderNo: createOrderRes.data.data.order_no,
        totalAmount: createOrderRes.data.data.total_amount,
        status: createOrderRes.data.data.status
      });
    } else {
      throw new Error('创建订单失败: ' + JSON.stringify(createOrderRes.data));
    }

    await sleep(500);

    // 步骤6: 查看订单列表
    log(6, '查看订单列表');
    const ordersRes = await request('/orders');
    
    if (ordersRes.data.success) {
      log(6, '✅ 订单列表', {
        orderCount: ordersRes.data.data.length,
        orders: ordersRes.data.data.map(order => ({
          id: order.id,
          orderNo: order.order_no,
          status: order.status,
          totalAmount: order.total_amount,
          createdAt: order.created_at
        }))
      });
    }

    await sleep(500);

    // 步骤7: 查看订单详情
    log(7, '查看订单详情');
    const orderDetailRes = await request(`/orders/${testOrderId}`);
    
    if (orderDetailRes.data.success) {
      const order = orderDetailRes.data.data;
      log(7, '✅ 订单详情', {
        orderId: order.id,
        orderNo: order.order_no,
        status: order.status,
        totalAmount: order.total_amount,
        shippingAddress: order.shipping_address,
        receiver: order.receiver,
        receiverPhone: order.receiver_phone,
        note: order.note,
        items: order.items?.map(item => ({
          productName: item.product_name,
          quantity: item.quantity,
          price: item.price,
          subtotal: item.subtotal
        }))
      });
    }

    await sleep(500);

    // 步骤8: 编辑订单
    log(8, '编辑订单（修改收货地址）');
    const editOrderRes = await request(`/orders/${testOrderId}`, {
      method: 'PUT',
      body: JSON.stringify({
        shipping_address: '上海市浦东新区新地址456号',
        receiver: '新收货人',
        receiver_phone: '13900139000',
        note: '已修改收货信息'
      })
    });
    
    if (editOrderRes.data.success) {
      log(8, '✅ 订单编辑成功', {
        orderId: editOrderRes.data.data.id,
        newAddress: editOrderRes.data.data.shipping_address,
        newReceiver: editOrderRes.data.data.receiver,
        newPhone: editOrderRes.data.data.receiver_phone,
        newNote: editOrderRes.data.data.note
      });
    } else {
      log(8, '⚠️ 订单编辑失败', editOrderRes.data);
    }

    await sleep(500);

    // 步骤9: 取消订单
    log(9, '取消订单');
    const cancelOrderRes = await request(`/orders/${testOrderId}/cancel`, {
      method: 'POST'
    });
    
    if (cancelOrderRes.data.success) {
      log(9, '✅ 订单取消成功', {
        orderId: cancelOrderRes.data.data.id,
        status: cancelOrderRes.data.data.status,
        cancelledAt: cancelOrderRes.data.data.cancelled_at
      });
    } else {
      log(9, '⚠️ 订单取消失败', cancelOrderRes.data);
    }

    await sleep(500);

    // 步骤10: 清空购物车
    log(10, '清空购物车');
    const clearCartRes = await request('/cart', {
      method: 'DELETE'
    });
    
    if (clearCartRes.data.success) {
      log(10, '✅ 购物车已清空');
    }

    console.log('\n' + '='.repeat(60));
    console.log('🎉 所有测试完成！');
    console.log('='.repeat(60) + '\n');

  } catch (error) {
    console.error('\n❌ 测试失败:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
};

runTests();
