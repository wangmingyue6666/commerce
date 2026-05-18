import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

// 数据库配置
const sequelize = new Sequelize({
  database: 'commerce',
  username: 'root',
  password: 'AA654321',
  host: 'localhost',
  port: 3306,
  dialect: 'mysql',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  define: {
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  },
  timezone: '+08:00' // 中国时区
});

// 测试数据库连接
export const testConnection = async (): Promise<boolean> => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');
    
    // 同步数据库（开发环境）
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      console.log('✅ Database synchronized.');
    }
    return true;
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
    return false;
  }
};

export default sequelize;