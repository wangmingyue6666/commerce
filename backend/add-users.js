// 添加测试用户脚本
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');

async function addTestUsers() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'AA654321',
    database: 'commerce'
  });

  try {
    const hashedPassword = bcrypt.hashSync('password123', 10);
    console.log('Password hash:', hashedPassword);

    // 删除现有用户
    await connection.execute('DELETE FROM users WHERE username IN (?, ?, ?)', ['admin', 'user1', 'user2']);

    // 添加新用户
    const users = [
      { username: 'admin', email: 'admin@example.com' },
      { username: 'user1', email: 'user1@example.com' },
      { username: 'user2', email: 'user2@example.com' }
    ];

    for (const user of users) {
      await connection.execute(
        'INSERT INTO users (username, password, email, status, created_at, updated_at) VALUES (?, ?, ?, 1, NOW(), NOW())',
        [user.username, hashedPassword, user.email]
      );
      console.log(`Added user: ${user.username}`);
    }

    console.log('\n✅ 所有测试用户添加成功！');
    console.log('登录凭证：');
    console.log('  - admin / password123');
    console.log('  - user1 / password123');
    console.log('  - user2 / password123');
  } finally {
    await connection.end();
  }
}

addTestUsers().catch(console.error);
