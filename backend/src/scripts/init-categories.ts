import sequelize from '../config/database';

const initCategories = async () => {
  await sequelize.authenticate();
  
  const sql = `
    INSERT INTO categories (id, name, icon, level, sort, status, created_at, updated_at) 
    VALUES 
      (1, '手机数码', '📱', 1, 1, 1, NOW(), NOW()), 
      (2, '电脑办公', '💻', 1, 2, 1, NOW(), NOW()), 
      (3, '服装鞋包', '👕', 1, 3, 1, NOW(), NOW()), 
      (4, '家用电器', '🏠', 1, 4, 1, NOW(), NOW()) 
    ON DUPLICATE KEY UPDATE 
      name=VALUES(name), 
      icon=VALUES(icon), 
      level=VALUES(level), 
      sort=VALUES(sort), 
      status=VALUES(status), 
      updated_at=NOW();
  `;

  await sequelize.query(sql);
  console.log('分类初始化完成');
  process.exit(0);
};

initCategories().catch(err => {
  console.error(err);
  process.exit(1);
});