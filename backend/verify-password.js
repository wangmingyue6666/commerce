const bcrypt = require('bcryptjs');

// 从数据库中获取的加密密码
const hashedPassword = '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVbUwq';
// 测试密码
const testPassword = 'password123';

async function verifyPassword() {
  try {
    // 验证密码
    const isMatch = await bcrypt.compare(testPassword, hashedPassword);
    console.log('密码验证结果:', isMatch);
    
    if (isMatch) {
      console.log('密码正确！');
    } else {
      console.log('密码错误！');
    }
  } catch (error) {
    console.error('错误:', error);
  }
}

verifyPassword();
