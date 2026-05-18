const mysql = require('mysql2');

// 创建连接配置
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'AA654321',
  database: 'commerce',
  port: 3306
});

// 尝试连接
connection.connect((err) => {
  if (err) {
    console.error('数据库连接失败:', err.code, '-', err.message);
    console.log('\n请确保MySQL服务已启动并运行在端口3306上');
    process.exit(1);
  }
  console.log('✅ 数据库连接成功!');
  connection.end();
});
