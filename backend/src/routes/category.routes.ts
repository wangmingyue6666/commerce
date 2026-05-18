import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import Category from '../models/category.model';

const router = Router();

router.get('/', async (_req, res) => {
  try {
    const categories = await Category.findAll({
      where: { status: 1 },
      order: [['sort', 'ASC'], ['id', 'ASC']]
    });
    res.json({ success: true, data: categories });
  } catch (error) {
    console.error('获取分类失败:', error);
    res.status(500).json({ success: false, message: '服务器内部错误' });
  }
});

router.get('/all', async (_req, res) => {
  try {
    const categories = await Category.findAll({
      order: [['sort', 'ASC'], ['id', 'ASC']]
    });
    res.json({ success: true, data: categories });
  } catch (error) {
    console.error('获取所有分类失败:', error);
    res.status(500).json({ success: false, message: '服务器内部错误' });
  }
});

router.post('/',
  [
    body('name').notEmpty().withMessage('分类名称不能为空').trim(),
    body('parent_id').optional().isInt({ min: 0 }).toInt(),
    body('level').optional().isInt({ min: 1 }).toInt(),
    body('sort').optional().isInt({ min: 0 }).toInt(),
    body('icon').optional().trim(),
    body('status').optional().isInt({ min: 0, max: 1 }).toInt()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: errors.array()[0].msg });
      }

      const { name, parent_id = 0, level = 1, sort = 0, icon = '', status = 1 } = req.body;

      const category = await Category.create({
        name,
        parent_id,
        level,
        sort,
        icon,
        status
      });

      res.json({ success: true, data: category, message: '分类创建成功' });
    } catch (error) {
      console.error('创建分类失败:', error);
      res.status(500).json({ success: false, message: '服务器内部错误' });
    }
  }
);

router.put('/:id',
  [
    body('name').optional().notEmpty().withMessage('分类名称不能为空').trim(),
    body('parent_id').optional().isInt({ min: 0 }).toInt(),
    body('level').optional().isInt({ min: 1 }).toInt(),
    body('sort').optional().isInt({ min: 0 }).toInt(),
    body('icon').optional().trim(),
    body('status').optional().isInt({ min: 0, max: 1 }).toInt()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: errors.array()[0].msg });
      }

      const { id } = req.params;
      const category = await Category.findByPk(id);

      if (!category) {
        return res.status(404).json({ success: false, message: '分类不存在' });
      }

      const { name, parent_id, level, sort, icon, status } = req.body;

      await category.update({
        ...(name !== undefined && { name }),
        ...(parent_id !== undefined && { parent_id }),
        ...(level !== undefined && { level }),
        ...(sort !== undefined && { sort }),
        ...(icon !== undefined && { icon }),
        ...(status !== undefined && { status })
      });

      res.json({ success: true, data: category, message: '分类更新成功' });
    } catch (error) {
      console.error('更新分类失败:', error);
      res.status(500).json({ success: false, message: '服务器内部错误' });
    }
  }
);

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findByPk(id);

    if (!category) {
      return res.status(404).json({ success: false, message: '分类不存在' });
    }

    await category.destroy();

    res.json({ success: true, message: '分类删除成功' });
  } catch (error) {
    console.error('删除分类失败:', error);
    res.status(500).json({ success: false, message: '服务器内部错误' });
  }
});

export default router;