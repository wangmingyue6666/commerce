const sequelize = require('./dist/config/database').default;
const User = require('./dist/models/user.model').default;

async function testUser() {
  try {
    // 连接数据库
    await sequelize.authenticate();
    console.log('数据库连接成功');
    
    // 查找admin用户
    const user = await User.findOne({
      where: {
        username: 'admin'
      }
    });
    
    if (user) {
      console.log('找到admin用户:', user.username);
      console.log('用户ID:', user.id);
      console.log('密码长度:', user.password ? user.password.length : '无密码');
      console.log('密码开头:', user.password ? user.password.substring(0, 20) + '...' : '无密码');
      console.log('用户状态:', user.status);
    } else {
      console.log('未找到admin用户');
      
      // 创建一个新的admin用户
      const newUser = await User.create({
        username: 'admin',
        password: 'password123',
        email: 'admin@example.com',
        status: 1
      });
      console.log('创建了新的admin用户:', newUser.username);
    }
  } catch (error) {
    console.error('错误:', error);
  } finally {
    await sequelize.close();
  }
}

testUser();
