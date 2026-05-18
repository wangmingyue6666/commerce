const mysql = require('mysql2/promise');

async function checkUser() {
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
    
    // 查询admin用户
    const [rows] = await connection.execute(
      'SELECT id, username, password, status FROM users WHERE username = ?',
      ['admin']
    );
    
    if (rows.length > 0) {
      const user = rows[0];
      console.log('找到admin用户:');
      console.log('ID:', user.id);
      console.log('用户名:', user.username);
      console.log('密码:', user.password);
      console.log('密码长度:', user.password.length);
      console.log('状态:', user.status);
    } else {
      console.log('未找到admin用户');
      
      // 尝试创建admin用户
      console.log('尝试创建admin用户...');
      const [result] = await connection.execute(
        'INSERT INTO users (username, password, email, status, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())',
        ['admin', 'password123', 'admin@example.com', 1]
      );
      console.log('创建admin用户成功，ID:', result.insertId);
    }
    
    await connection.end();
  } catch (error) {
    console.error('错误:', error);
  }
}

checkUser();
