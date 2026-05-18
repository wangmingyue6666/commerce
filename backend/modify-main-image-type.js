const { Sequelize, DataTypes } = require('sequelize');

// 创建Sequelize实例
const sequelize = new Sequelize('commerce', 'root', 'AA654321', {
  host: 'localhost',
  dialect: 'mysql',
  port: 3306
});

// 定义Product模型
const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  category_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  stock: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  sales: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  main_image: {
    type: DataTypes.TEXT('long'),
    allowNull: true
  },
  images: {
    type: DataTypes.TEXT('long'),
    allowNull: true
  },
  status: {
    type: DataTypes.TINYINT,
    allowNull: false
  }
}, {
  tableName: 'products',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// 修改main_image字段类型
async function modifyMainImageType() {
  try {
    // 连接数据库
    await sequelize.authenticate();
    console.log('数据库连接成功');

    // 修改字段类型
    await sequelize.query('ALTER TABLE products MODIFY COLUMN main_image LONGTEXT;');
    console.log('main_image字段类型修改成功');

    // 关闭连接
    await sequelize.close();
    console.log('数据库连接已关闭');
  } catch (error) {
    console.error('修改字段类型失败:', error);
    await sequelize.close();
  }
}

// 运行脚本
modifyMainImageType();
