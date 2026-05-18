import { Router } from 'express';

const router = Router();

router.post('/', (_req, res) => {
  res.status(501).json({
    success: false,
    message: '上传功能未在简化开发模式中启用'
  });
});

export default router;
