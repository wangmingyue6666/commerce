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
    console.log('🚀 开始测试订单管理模块...\n');

    // 1. 用户登录/注册
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
      console.log('✅ 登录成功');
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
        console.log('✅ 注册并登录成功');
      } else {
        throw new Error('注册失败: ' + registerRes.data.message);
      }
    }

    // 2. 获取商品列表
    console.log('\n步骤2: 获取商品列表...');
    const productsRes = await request('/products');
    const products = productsRes.data.data?.products || productsRes.data.data || [];
    
    let productId = 0;
    
    if (products.length === 0) {
      console.log('⚠️ 商品列表为空，创建测试分类和商品...');
      
      // 创建测试分类
      console.log('创建测试分类...');
      const createCategoryRes = await request('/categories', {
        method: 'POST',
        body: JSON.stringify({
          name: '测试分类',
          parent_id: 0,
          level: 1
        })
      });
      console.log('创建分类:', createCategoryRes.data);
      
      const categoryId = createCategoryRes.data.data?.id || 1;
      
      // 创建测试商品
      console.log('创建测试商品...');
      const createProductRes = await request('/products', {
        method: 'POST',
        body: JSON.stringify({
          name: '测试商品',
          category_id: categoryId,
          brand: '测试品牌',
          price: 99.99,
          stock: 100,
          description: '这是一个测试商品'
        })
      });
      console.log('创建商品:', createProductRes.data);
      
      productId = createProductRes.data.data?.id;
    } else {
      productId = products[0].id;
    }
    
    console.log(`✅ 商品ID: ${productId}`);

    // 3. 添加商品到购物车
    console.log('\n步骤3: 添加商品到购物车...');
    const addToCartRes = await request('/cart', {
      method: 'POST',
      body: JSON.stringify({
        product_id: productId,
        quantity: 2
      })
    });
    console.log('添加购物车:', addToCartRes.data);
    
    if (!addToCartRes.data.success) {
      throw new Error('添加购物车失败');
    }
    console.log('✅ 添加购物车成功');

    // 4. 创建订单
    console.log('\n步骤4: 创建订单...');
    const createOrderRes = await request('/orders', {
      method: 'POST',
      body: JSON.stringify({
        items: [{ product_id: productId, quantity: 2 }],
        shipping_address: '测试地址',
        receiver: '测试用户',
        receiver_phone: '13800138000'
      })
    });
    
    console.log('订单创建响应:', JSON.stringify(createOrderRes.data));
    
    if (createOrderRes.data.success) {
      console.log('\n✅ 订单创建成功！');
      console.log(`订单ID: ${createOrderRes.data.data.id}`);
      console.log(`订单号: ${createOrderRes.data.data.order_no}`);
      console.log(`总金额: ${createOrderRes.data.data.total_amount}`);
      console.log(`状态: ${createOrderRes.data.data.status}`);
    } else {
      console.log('\n❌ 订单创建失败:', createOrderRes.data.message || JSON.stringify(createOrderRes.data));
    }

    // 5. 查看订单列表
    console.log('\n步骤5: 查看订单列表...');
    const ordersRes = await request('/orders');
    console.log('订单列表:', JSON.stringify(ordersRes.data));

    console.log('\n🎉 测试完成！');

  } catch (error) {
    console.error('\n❌ 测试失败:', error.message);
    process.exit(1);
  }
};

runTests();
