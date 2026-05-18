const axios = require('axios');

// 简单的测试脚本，用于测试商品创建接口
async function testProductCreation() {
  try {
    // 1. 先登录获取令牌
    console.log('正在登录...');
    const loginResponse = await axios.post('http://localhost:3000/api/auth/login', {
      username: 'admin',
      password: 'password123'
    });

    console.log('登录接口返回数据:', loginResponse.data);
    const token = loginResponse.data.data?.token || loginResponse.data.token || loginResponse.data.access_token;
    console.log('登录成功，获取到令牌:', token);

    // 2. 模拟一个400kb的jpg图片的Base64编码
    // 这里使用一个简单的Base64编码作为示例
    const base64Image = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgFBgcGBQgHBgcJCAgJDBMMDAsLDBgREg4THBgdHRsYGxofIywlHyEqIRobJjQnKi4vMTYxOyUxOnk6Ojo6Onq8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwDk8AAAAAAAAAAAAAAP/jcgBIAADBAAEBAQAAAP/AEAhAAQABAMQAAAEAAAAAAAAAAAAAAAIQQQAQAAAAAAAAAAAAAAAAAAAAD/9k=';

    // 3. 商品数据
    const productData = {
      name: 'Test Product',
      category_id: 1,
      price: 100,
      stock: 10,
      main_image: base64Image,
      images: [base64Image]
    };

    // 4. 发送POST请求到商品创建接口
    console.log('正在创建商品...');
    const response = await axios.post('http://localhost:3000/api/products', productData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('商品创建成功:', response.data);
  } catch (error) {
    console.error('测试失败:', error.response ? error.response.data : error.message);
  }
}

testProductCreation();
