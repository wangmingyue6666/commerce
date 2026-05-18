const axios = require('axios');

// 测试图片数据（Base64格式）
const testImage1 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEMAAAAMCAYAAAA5xADKAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAA7SURBVEhL7dCxDQAgEMPAD/vvHFqLARASvjJV5LTtPCrJ3Ly3zuFnxgBjgDHAGGAMMAYYA4wBxgBjwAbKnAcUSuUD5QAAAABJRU5ErkJggg==';
const testImage2 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAI0AAAAJCAYAAAAPf69rAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAI8SURBVFhH7ZexrzlBEMcnrxMh0QgJSgkVEo1QqMRfgESh4g/Q6CSipqbSCZWKXqjRiKgl1KK/57u/23t7+/Y53uP3+yXvPslkc3szt2N3dmbQarXSvF6vNp1ONcCfx+Oxdjwe2Rzncrlo+Xxeq1arhr5Ip9Nh714J9wFric+yP7IvXM/lcj0s2A/si80fSLVJomCjseFA3HiMrVbrk74sov0rQGCnUqlPh2oVwLCLRCJG8NncD+njlzeWg/lisWjo1Ov1hw/qJ2AtBIeY/bjPqjXhIw9cBIecNWGjmrex5o3uZLfbUTQa1Z+IyuUy5XI5crvdhjSbTRoOh6Y5SK1W062+j8/no1AoROFwmLrdLp1OJ0omkxQMBqnX6+laH1yDic7nM5PtdsvsObCHn4fDgX1P9leU2WymW9kYiKVEJTx942aiz7mVjf4GWPsnGYJnIKs+hZevf/lb/1fuKk94h9I0n89NOvwAbskrewYcOg5ftS4XcX34y5t+BIRKXxbVfvx27ipPTqeTpfNEIqHPfJBOp+l6K41SIEqpVNK1ngfKBcokylMsFqNGo6H0YTQakcPhoGw2y+zW6zW1223abDYUj8fJ4/HQ9RKYbETZ7/cUCASYrY2ZN167/X4/LRYLKhQKD9V12MBWtoEg0J7NZDKhTCZj9CjXssnGfr/PRoAAqVQqNBgMWGABjMvl0tTb2HwTPeNY/nsCsg5GPGNeBfqgZ5anr/oMPo/18M6qrHB9uRSp5NZ3fiea9g44lkqS9JntsgAAAABJRU5ErkJggg==';

const API_BASE = 'http://localhost:3000/api';
let token = '';

// 登录获取token
async function login() {
  try {
    const response = await axios.post(`${API_BASE}/auth/login`, {
      username: 'admin',
      password: 'password123'
    });
    token = response.data.data.token;
    console.log('登录成功，获取到token');
  } catch (error) {
    console.error('登录失败:', error.response?.data || error.message);
    throw error;
  }
}

// 测试更新产品图片
async function testUpdateProductImages() {
  try {
    console.log('测试更新产品图片...');
    
    const productData = {
      images: JSON.stringify([testImage1, testImage2]),
      main_image: testImage1
    };
    
    const response = await axios.put(`${API_BASE}/products/20`, productData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('更新产品图片成功:', response.data);
    return response.data;
  } catch (error) {
    console.error('更新产品图片失败:', error.response?.data || error.message);
    throw error;
  }
}

// 测试获取产品信息
async function testGetProduct() {
  try {
    console.log('获取产品信息...');
    
    const response = await axios.get(`${API_BASE}/products/20`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('产品信息:', {
      id: response.data.data.id,
      name: response.data.data.name,
      images: response.data.data.images,
      main_image: response.data.data.main_image
    });
    return response.data;
  } catch (error) {
    console.error('获取产品信息失败:', error.response?.data || error.message);
    throw error;
  }
}

// 主测试函数
async function runTest() {
  try {
    console.log('开始测试图片上传功能...');
    
    // 1. 登录
    await login();
    
    // 2. 测试更新产品图片
    await testUpdateProductImages();
    
    // 3. 获取产品信息验证
    await testGetProduct();
    
    console.log('测试完成，所有操作成功！');
  } catch (error) {
    console.error('测试失败:', error);
  }
}

runTest();
