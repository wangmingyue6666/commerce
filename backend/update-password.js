const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function updatePassword() {
  try {
    // 创建数据库连接
    const connection = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: 'AA654321',
      database: 'commerce'
    });
    
    console.log('数据库连接成功');
    
    // 生成加密密码
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);
    console.log('生成的加密密码:', hashedPassword);
    
    // 更新admin用户的密码
    const [result] = await connection.execute(
      'UPDATE users SET password = ? WHERE username = ?',
      [hashedPassword, 'admin']
    );
    
    console.log('更新密码成功，影响行数:', result.affectedRows);
    
    // 验证密码
    const isMatch = await bcrypt.compare('password123', hashedPassword);
    console.log('密码验证结果:', isMatch);
    
    await connection.end();
  } catch (error) {
    console.error('错误:', error);
  }
}

updatePassword();
