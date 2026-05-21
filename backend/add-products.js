// 添加测试商品脚本
const mysql = require('mysql2/promise');

async function addTestProducts() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'AA654321',
    database: 'commerce'
  });

  try {
    // 添加测试商品
    const products = [
      {
        name: 'iPhone 15 Pro Max',
        description: '苹果最新旗舰手机，搭载A17 Pro芯片',
        price: 9999,
        stock: 100,
        category_id: 1,
        images: '["https://example.com/iphone1.jpg", "https://example.com/iphone2.jpg"]',
        status: 1
      },
      {
        name: 'MacBook Pro 14寸',
        description: 'Apple M3 Pro芯片，18小时续航',
        price: 14999,
        stock: 50,
        category_id: 1,
        images: '["https://example.com/macbook1.jpg"]',
        status: 1
      },
      {
        name: 'AirPods Pro 2',
        description: '主动降噪，空间音频',
        price: 1899,
        stock: 200,
        category_id: 1,
        images: '["https://example.com/airpods1.jpg"]',
        status: 1
      },
      {
        name: '小米14 Ultra',
        description: '徕卡光学镜头，骁龙8 Gen 3',
        price: 6499,
        stock: 150,
        category_id: 1,
        images: '["https://example.com/xiaomi1.jpg"]',
        status: 1
      },
      {
        name: '华为Mate 60 Pro',
        description: '麒麟9000S芯片，卫星通话',
        price: 6999,
        stock: 80,
        category_id: 1,
        images: '["https://example.com/huawei1.jpg"]',
        status: 1
      }
    ];

    for (const product of products) {
      await connection.execute(
        'INSERT INTO products (name, description, price, stock, category_id, images, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
        [product.name, product.description, product.price, product.stock, product.category_id, product.images, product.status]
      );
      console.log(`Added product: ${product.name}`);
    }

    // 添加测试分类
    await connection.execute('INSERT IGNORE INTO categories (name, description, created_at, updated_at) VALUES (?, ?, NOW(), NOW())', ['电子产品', '各类电子设备']);
    console.log('Added category: 电子产品');

    console.log('\n✅ 测试商品添加成功！');
  } finally {
    await connection.end();
  }
}

addTestProducts().catch(console.error);
