-- 电商商城数据库初始化脚本
-- 创建数据库
CREATE DATABASE IF NOT EXISTS `ecommerce` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `ecommerce`;

-- 用户表
CREATE TABLE `users` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `username` VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
  `password` VARCHAR(255) NOT NULL COMMENT '密码',
  `email` VARCHAR(100) UNIQUE COMMENT '邮箱',
  `phone` VARCHAR(20) COMMENT '手机号',
  `avatar` VARCHAR(255) COMMENT '头像URL',
  `nickname` VARCHAR(50) COMMENT '昵称',
  `gender` TINYINT DEFAULT 0 COMMENT '性别: 0-未知, 1-男, 2-女',
  `birthday` DATE COMMENT '生日',
  `status` TINYINT DEFAULT 1 COMMENT '状态: 0-禁用, 1-正常',
  `last_login` DATETIME COMMENT '最后登录时间',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_username (`username`),
  INDEX idx_email (`email`),
  INDEX idx_phone (`phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- 收货地址表
CREATE TABLE `addresses` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `user_id` INT NOT NULL COMMENT '用户ID',
  `receiver` VARCHAR(50) NOT NULL COMMENT '收货人',
  `phone` VARCHAR(20) NOT NULL COMMENT '手机号',
  `province` VARCHAR(50) NOT NULL COMMENT '省份',
  `city` VARCHAR(50) NOT NULL COMMENT '城市',
  `district` VARCHAR(50) NOT NULL COMMENT '区县',
  `detail` VARCHAR(255) NOT NULL COMMENT '详细地址',
  `is_default` TINYINT DEFAULT 0 COMMENT '是否默认地址: 0-否, 1-是',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX idx_user_id (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='收货地址表';

-- 商品分类表
CREATE TABLE `categories` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `name` VARCHAR(50) NOT NULL COMMENT '分类名称',
  `parent_id` INT DEFAULT 0 COMMENT '父分类ID',
  `level` TINYINT DEFAULT 1 COMMENT '分类层级',
  `sort` INT DEFAULT 0 COMMENT '排序',
  `icon` VARCHAR(255) COMMENT '图标',
  `status` TINYINT DEFAULT 1 COMMENT '状态: 0-禁用, 1-启用',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_parent_id (`parent_id`),
  INDEX idx_sort (`sort`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='商品分类表';

-- 商品表
CREATE TABLE `products` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `name` VARCHAR(200) NOT NULL COMMENT '商品名称',
  `category_id` INT NOT NULL COMMENT '分类ID',
  `brand` VARCHAR(50) COMMENT '品牌',
  `price` DECIMAL(10,2) NOT NULL COMMENT '价格',
  `market_price` DECIMAL(10,2) COMMENT '市场价',
  `stock` INT DEFAULT 0 COMMENT '库存',
  `sales` INT DEFAULT 0 COMMENT '销量',
  `main_image` VARCHAR(255) COMMENT '主图',
  `images` TEXT COMMENT '商品图片(JSON数组)',
  `description` TEXT COMMENT '商品描述',
  `detail` LONGTEXT COMMENT '商品详情(HTML)',
  `status` TINYINT DEFAULT 1 COMMENT '状态: 0-下架, 1-上架',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`),
  INDEX idx_category_id (`category_id`),
  INDEX idx_price (`price`),
  INDEX idx_sales (`sales`),
  FULLTEXT INDEX idx_name (`name`) WITH PARSER ngram
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='商品表';

-- 购物车表
CREATE TABLE `cart_items` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `user_id` INT NOT NULL COMMENT '用户ID',
  `product_id` INT NOT NULL COMMENT '商品ID',
  `quantity` INT DEFAULT 1 COMMENT '数量',
  `selected` TINYINT DEFAULT 1 COMMENT '是否选中: 0-否, 1-是',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`),
  UNIQUE KEY uk_user_product (`user_id`, `product_id`),
  INDEX idx_user_id (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='购物车表';

-- 订单表
CREATE TABLE `orders` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `order_no` VARCHAR(50) NOT NULL UNIQUE COMMENT '订单号',
  `user_id` INT NOT NULL COMMENT '用户ID',
  `address_id` INT NOT NULL COMMENT '收货地址ID',
  `total_amount` DECIMAL(10,2) NOT NULL COMMENT '订单总金额',
  `discount_amount` DECIMAL(10,2) DEFAULT 0 COMMENT '优惠金额',
  `shipping_amount` DECIMAL(10,2) DEFAULT 0 COMMENT '运费',
  `pay_amount` DECIMAL(10,2) NOT NULL COMMENT '实付金额',
  `payment_method` VARCHAR(20) COMMENT '支付方式',
  `payment_time` DATETIME COMMENT '支付时间',
  `shipping_method` VARCHAR(50) COMMENT '配送方式',
  `shipping_time` DATETIME COMMENT '发货时间',
  `receive_time` DATETIME COMMENT '收货时间',
  `status` TINYINT DEFAULT 0 COMMENT '状态: 0-待支付, 1-已支付, 2-已发货, 3-已完成, 4-已取消',
  `remark` VARCHAR(500) COMMENT '订单备注',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`),
  FOREIGN KEY (`address_id`) REFERENCES `addresses`(`id`),
  INDEX idx_order_no (`order_no`),
  INDEX idx_user_id (`user_id`),
  INDEX idx_status (`status`),
  INDEX idx_created_at (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='订单表';

-- 订单商品表
CREATE TABLE `order_items` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `order_id` INT NOT NULL COMMENT '订单ID',
  `product_id` INT NOT NULL COMMENT '商品ID',
  `product_name` VARCHAR(200) NOT NULL COMMENT '商品名称',
  `product_image` VARCHAR(255) COMMENT '商品图片',
  `price` DECIMAL(10,2) NOT NULL COMMENT '单价',
  `quantity` INT NOT NULL COMMENT '数量',
  `total_price` DECIMAL(10,2) NOT NULL COMMENT '总价',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`),
  INDEX idx_order_id (`order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='订单商品表';

-- 商品评价表
CREATE TABLE `reviews` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `user_id` INT NOT NULL COMMENT '用户ID',
  `product_id` INT NOT NULL COMMENT '商品ID',
  `order_id` INT NOT NULL COMMENT '订单ID',
  `rating` TINYINT NOT NULL COMMENT '评分: 1-5',
  `content` TEXT COMMENT '评价内容',
  `images` TEXT COMMENT '评价图片(JSON数组)',
  `is_anonymous` TINYINT DEFAULT 0 COMMENT '是否匿名: 0-否, 1-是',
  `status` TINYINT DEFAULT 1 COMMENT '状态: 0-隐藏, 1-显示',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`),
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`),
  FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`),
  UNIQUE KEY uk_order_product (`order_id`, `product_id`),
  INDEX idx_product_id (`product_id`),
  INDEX idx_rating (`rating`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='商品评价表';

-- 插入测试数据

-- 插入用户
INSERT INTO `users` (`username`, `password`, `email`, `phone`, `nickname`, `avatar`) VALUES
('admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVbUwq', 'admin@example.com', '13800138000', '管理员', 'https://example.com/avatar1.jpg'),
('user1', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVbUwq', 'user1@example.com', '13800138001', '用户1', 'https://example.com/avatar2.jpg'),
('user2', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVbUwq', 'user2@example.com', '13800138002', '用户2', 'https://example.com/avatar3.jpg');

-- 插入收货地址
INSERT INTO `addresses` (`user_id`, `receiver`, `phone`, `province`, `city`, `district`, `detail`, `is_default`) VALUES
(1, '张三', '13800138000', '北京市', '北京市', '朝阳区', '建国门外大街1号', 1),
(1, '李四', '13800138001', '上海市', '上海市', '浦东新区', '陆家嘴环路100号', 0),
(2, '王五', '13800138002', '广东省', '深圳市', '南山区', '科技园南区', 1);

-- 插入商品分类
INSERT INTO `categories` (`name`, `parent_id`, `level`, `sort`, `icon`) VALUES
('服装服饰', 0, 1, 1, '👕'),
('电子产品', 0, 1, 2, '📱'),
('家居生活', 0, 1, 3, '🏠'),
('美妆个护', 0, 1, 4, '💄'),
('食品饮料', 0, 1, 5, '🍔'),
('女装', 1, 2, 1, '👚'),
('男装', 1, 2, 2, '👔'),
('手机', 2, 2, 1, '📱'),
('电脑', 2, 2, 2, '💻');

-- 插入商品
INSERT INTO `products` (`name`, `category_id`, `brand`, `price`, `market_price`, `stock`, `sales`, `main_image`, `description`) VALUES
('夏季连衣裙', 6, 'ZARA', 299.00, 399.00, 100, 50, 'https://example.com/dress1.jpg', '夏季新款连衣裙，舒适透气'),
('男士衬衫', 7, 'UNIQLO', 199.00, 299.00, 200, 30, 'https://example.com/shirt1.jpg', '男士商务衬衫，经典款式'),
('iPhone 15', 8, 'Apple', 6999.00, 7999.00, 50, 100, 'https://example.com/iphone15.jpg', '最新款iPhone手机'),
('MacBook Pro', 9, 'Apple', 12999.00, 14999.00, 30, 80, 'https://example.com/macbook.jpg', '专业级笔记本电脑'),
('护肤品套装', 4, 'Lancome', 899.00, 1299.00, 150, 60, 'https://example.com/skincare.jpg', '护肤套装，保湿滋润');

-- 插入购物车数据
INSERT INTO `cart_items` (`user_id`, `product_id`, `quantity`) VALUES
(2, 1, 2),
(2, 3, 1),
(3, 2, 1),
(3, 4, 1);

-- 插入订单数据
INSERT INTO `orders` (`order_no`, `user_id`, `address_id`, `total_amount`, `pay_amount`, `status`) VALUES
('202404210001', 2, 3, 299.00, 299.00, 3),
('202404210002', 3, 3, 12999.00, 12999.00, 2);

-- 插入订单商品
INSERT INTO `order_items` (`order_id`, `product_id`, `product_name`, `product_image`, `price`, `quantity`, `total_price`) VALUES
(1, 1, '夏季连衣裙', 'https://example.com/dress1.jpg', 299.00, 1, 299.00),
(2, 4, 'MacBook Pro', 'https://example.com/macbook.jpg', 12999.00, 1, 12999.00);

-- 插入评价数据
INSERT INTO `reviews` (`user_id`, `product_id`, `order_id`, `rating`, `content`) VALUES
(2, 1, 1, 5, '裙子很漂亮，质量很好，穿着很舒服！'),
(3, 4, 2, 4, '电脑性能很强，就是价格有点贵。');

-- 创建视图：商品销售统计
CREATE VIEW `product_sales_stats` AS
SELECT 
  p.id,
  p.name,
  p.category_id,
  c.name as category_name,
  p.brand,
  p.price,
  SUM(oi.quantity) as total_sold,
  SUM(oi.total_price) as total_revenue,
  AVG(r.rating) as avg_rating
FROM products p
LEFT JOIN order_items oi ON p.id = oi.product_id
LEFT JOIN orders o ON oi.order_id = o.id AND o.status >= 1
LEFT JOIN categories c ON p.category_id = c.id
LEFT JOIN reviews r ON p.id = r.product_id AND r.status = 1
GROUP BY p.id;

-- 创建存储过程：生成订单号
DELIMITER //
CREATE PROCEDURE `generate_order_no`(OUT order_no VARCHAR(50))
BEGIN
  DECLARE date_str VARCHAR(8);
  DECLARE seq INT;
  
  SET date_str = DATE_FORMAT(NOW(), '%Y%m%d');
  
  SELECT COALESCE(MAX(SUBSTRING(order_no, 9)), 0) + 1 INTO seq
  FROM orders 
  WHERE order_no LIKE CONCAT(date_str, '%');
  
  SET order_no = CONCAT(date_str, LPAD(seq, 4, '0'));
END //
DELIMITER ;

-- 创建触发器：更新商品销量
DELIMITER //
CREATE TRIGGER `update_product_sales` AFTER INSERT ON `order_items`
FOR EACH ROW
BEGIN
  UPDATE products 
  SET sales = sales + NEW.quantity
  WHERE id = NEW.product_id;
END //
DELIMITER ;

-- 显示表结构
SHOW TABLES;

-- 显示各表记录数
SELECT 
  TABLE_NAME,
  TABLE_ROWS
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA = 'ecommerce'
ORDER BY TABLE_NAME;