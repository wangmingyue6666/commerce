const API_BASE = 'http://localhost:3000/api';

let authToken = '';

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

const runTests = async () => {
  try {
    console.log('🚀 开始测试订单创建功能...\n');

    // 1. 登录
    console.log('步骤1: 用户登录...');
    const loginRes = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        username: 'testuser',
        password: '123456'
      })
    });
    
    if (loginRes.data.success) {
      authToken = loginRes.data.data.token;
      console.log('✅ 登录成功\n');
    } else {
      console.log('⚠️ 登录失败，尝试注册...');
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
        console.log('✅ 注册并登录成功\n');
      } else {
        throw new Error('注册失败: ' + JSON.stringify(registerRes.data));
      }
    }

    // 2. 获取商品列表
    console.log('步骤2: 获取商品列表...');
    const productsRes = await request('/products');
    
    if (!productsRes.data.success) {
      throw new Error('获取商品失败');
    }
    
    const products = productsRes.data.data?.products || productsRes.data.data || [];
    if (products.length === 0) {
      throw new Error('商品列表为空');
    }
    
    const productId = products[0].id;
    console.log(`✅ 找到商品: ID=${productId}, 名称=${products[0].name}, 库存=${products[0].stock}\n`);

    // 3. 创建订单
    console.log('步骤3: 创建订单...');
    const createOrderRes = await request('/orders', {
      method: 'POST',
      body: JSON.stringify({
        items: [{ product_id: productId, quantity: 1 }],
        shipping_address: '测试地址',
        receiver: '测试用户',
        receiver_phone: '13800138000'
      })
    });
    
    console.log('订单创建响应:', JSON.stringify(createOrderRes.data, null, 2));
    
    if (createOrderRes.data.success) {
      console.log('\n✅ 订单创建成功！');
      console.log(`订单ID: ${createOrderRes.data.data.id}`);
      console.log(`订单号: ${createOrderRes.data.data.order_no}`);
      console.log(`总金额: ${createOrderRes.data.data.total_amount}`);
      console.log(`状态: ${createOrderRes.data.data.status}`);
    } else {
      console.log('\n❌ 订单创建失败:', createOrderRes.data.message || JSON.stringify(createOrderRes.data));
    }

    console.log('\n🎉 测试完成！');

  } catch (error) {
    console.error('\n❌ 测试失败:', error.message);
    process.exit(1);
  }
};

runTests();
