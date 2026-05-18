import sequelize from '../config/database';

async function addDeletedAtColumn() {
  try {
    console.log('开始添加deleted_at字段...');
    
    // 检查deleted_at字段是否已存在
    const [rows] = await sequelize.query('SHOW COLUMNS FROM products WHERE Field = ?', {
      replacements: ['deleted_at']
    });
    
    if (Array.isArray(rows) && rows.length === 0) {
      // 添加deleted_at字段
      await sequelize.query('ALTER TABLE products ADD COLUMN deleted_at DATETIME NULL');
      console.log('deleted_at字段添加成功');
    } else {
      console.log('deleted_at字段已存在');
    }
    
    console.log('迁移完成');
  } catch (error) {
    console.error('添加deleted_at字段失败:', error);
  } finally {
    await sequelize.close();
  }
}

addDeletedAtColumn();