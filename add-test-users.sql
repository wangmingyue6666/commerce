USE commerce;

-- 添加测试用户 user1
INSERT INTO users (username, password, email, status, created_at, updated_at)
VALUES ('user1', '$2a$10$cg.pTd.uIrGCxz2HsXzGV.hUQWWUwueJrcTUVePC46y6GZiCn4w0e', 'user1@example.com', 1, NOW(), NOW());

-- 添加测试用户 user2
INSERT INTO users (username, password, email, status, created_at, updated_at)
VALUES ('user2', '$2a$10$cg.pTd.uIrGCxz2HsXzGV.hUQWWUwueJrcTUVePC46y6GZiCn4w0e', 'user2@example.com', 1, NOW(), NOW());

-- 添加测试用户 admin
INSERT INTO users (username, password, email, status, created_at, updated_at)
VALUES ('admin', '$2a$10$cg.pTd.uIrGCxz2HsXzGV.hUQWWUwueJrcTUVePC46y6GZiCn4w0e', 'admin@example.com', 1, NOW(), NOW());

SELECT '测试用户添加成功' AS result;
