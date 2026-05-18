import { Router } from 'express';
import { authenticateToken } from '../middlewares/auth.middleware';
import { users } from '../data/store';
import User from '../models/user.model';

const router = Router();

router.get('/', authenticateToken, (_req, res) => {
  const safeUsers = users.map(({ password: _password, ...rest }) => rest);
  res.json({ success: true, data: safeUsers, total: safeUsers.length });
});

router.delete('/:username', authenticateToken, async (req, res) => {
  const { username } = req.params;
  
  try {
    const user = await User.findOne({ where: { username } });
    if (!user) {
      res.status(404).json({ success: false, message: '用户不存在' });
      return;
    }
    
    await user.destroy();
    res.json({ success: true, message: '用户已删除' });
  } catch (error: any) {
    console.error('删除用户错误:', error);
    res.status(500).json({ success: false, message: '服务器内部错误' });
  }
});

export default router;
