const bcrypt = require('bcryptjs');
const sequelize = require('./src/config/database').default;
const User = require('./src/models/user.model').default;

async function resetAdminPassword() {
  try {
    await sequelize.authenticate();
    console.log('数据库连接成功');

    const user = await User.findOne({ where: { username: 'admin' } });
    
    if (!user) {
      console.log('admin用户不存在，创建新用户');
      await User.create({
        username: 'admin',
        password: 'password123',
        email: 'admin@example.com',
        nickname: '管理员',
        status: 1
      });
      console.log('admin用户创建成功');
    } else {
      console.log('找到admin用户，重置密码...');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('password123', salt);
      await user.update({ password: hashedPassword });
      console.log('admin密码重置成功');
    }

    await sequelize.close();
  } catch (error) {
    console.error('重置密码失败:', error);
    process.exit(1);
  }
}

resetAdminPassword();