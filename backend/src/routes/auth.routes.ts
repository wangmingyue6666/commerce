import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { Op } from 'sequelize';
import { authenticateToken } from '../middlewares/auth.middleware';
import User from '../models/user.model';
import sequelize from '../config/database';

const router = Router();

router.post('/login', async (req, res) => {
  const { username, password } = req.body as { username?: string; password?: string };
  if (!username || !password) {
    res.status(400).json({ success: false, message: '请填写用户名和密码' });
    return;
  }

  try {
    // 检查数据库连接
    await sequelize.authenticate();
    
    // 查找用户（支持用户名或邮箱登录）
    const user = await User.findOne({
      where: {
        [Op.or]: [
          { username },
          { email: username }
        ]
      }
    });

    if (!user) {
      res.status(401).json({ success: false, message: '用户名或密码错误' });
      return;
    }

    // 检查用户状态
    if (user.status !== 1) {
      res.status(403).json({ success: false, message: '账号已被禁用' });
      return;
    }

    // 验证密码
    const valid = await user.validatePassword(password);
    if (!valid) {
      res.status(401).json({ success: false, message: '用户名或密码错误' });
      return;
    }

    // 更新最后登录时间
    await user.update({ last_login: new Date() });

    // 生成JWT令牌
    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email },
      process.env.JWT_SECRET || 'ecommerce_secret_key_2026',
      { expiresIn: '7d' }
    );

    // 返回用户信息（排除密码）
    const safeUser = user.toJSON();
    res.json({ success: true, data: { token, user: safeUser } });
  } catch (error: any) {
    console.error('登录错误:', error);
    if (error.name === 'SequelizeConnectionError' || error.code === 'ER_ACCESS_DENIED_ERROR') {
      res.status(500).json({ success: false, message: '数据库连接失败，请检查数据库配置' });
    } else {
      res.status(500).json({ success: false, message: '服务器内部错误' });
    }
  }
});

router.post('/register', async (req, res) => {
  const { username, password, email, nickname } = req.body as { username?: string; password?: string; email?: string; nickname?: string };
  
  if (!username || !password) {
    res.status(400).json({ success: false, message: '请填写用户名和密码' });
    return;
  }

  if (password.length < 6) {
    res.status(400).json({ success: false, message: '密码至少需要6个字符' });
    return;
  }

  try {
    // 检查用户名是否已存在
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [
          { username },
          { email }
        ]
      }
    });

    if (existingUser) {
      res.status(409).json({ success: false, message: '用户名或邮箱已被使用' });
      return;
    }

    // 创建用户（密码会自动通过钩子加密）
    const user = await User.create({
      username,
      password,
      email,
      nickname: nickname || username,
      status: 1
    });

    const safeUser = user.toJSON();
    res.status(201).json({ success: true, data: safeUser, message: '注册成功' });
  } catch (error: any) {
    console.error('注册错误:', error);
    res.status(500).json({ success: false, message: '服务器内部错误' });
  }
});

router.get('/me', authenticateToken, async (req, res) => {
  const authUser = ((req as unknown) as { user?: { id: number } }).user;
  if (!authUser?.id) {
    res.status(401).json({ success: false, message: '未授权' });
    return;
  }

  try {
    const current = await User.findByPk(authUser.id);
    if (!current) {
      res.status(404).json({ success: false, message: '用户不存在' });
      return;
    }

    const safeUser = current.toJSON();
    res.json({ success: true, data: safeUser });
  } catch (error) {
    console.error('获取用户信息错误:', error);
    res.status(500).json({ success: false, message: '服务器内部错误' });
  }
});

export default router;
