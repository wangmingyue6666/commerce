# 部署文档

## 环境要求

### 服务器要求
- **操作系统**: Ubuntu 20.04+ / CentOS 7+ / Windows Server 2019+
- **内存**: 4GB+ (推荐8GB)
- **存储**: 50GB+ SSD
- **带宽**: 10Mbps+ (推荐100Mbps)

### 软件要求
- **Node.js**: 16.x+
- **MySQL**: 8.0+
- **Nginx**: 1.18+
- **PM2**: 5.0+ (Node.js进程管理)
- **Git**: 2.20+

## 部署步骤

### 1. 服务器准备

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装基础工具
sudo apt install -y curl wget git vim htop

# 设置时区
sudo timedatectl set-timezone Asia/Shanghai
```

### 2. 安装Node.js

```bash
# 使用NodeSource安装Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# 验证安装
node --version
npm --version

# 安装yarn和pm2
sudo npm install -g yarn pm2
```

### 3. 安装MySQL

```bash
# 安装MySQL
sudo apt install -y mysql-server

# 启动MySQL
sudo systemctl start mysql
sudo systemctl enable mysql

# 安全配置
sudo mysql_secure_installation

# 创建数据库和用户
sudo mysql -u root -p

# 在MySQL中执行
CREATE DATABASE ecommerce CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'ecommerce_user'@'localhost' IDENTIFIED BY 'your_strong_password';
GRANT ALL PRIVILEGES ON ecommerce.* TO 'ecommerce_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 4. 安装Nginx

```bash
# 安装Nginx
sudo apt install -y nginx

# 启动Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 5. 部署后端

```bash
# 克隆代码
cd /var/www
sudo git clone https://github.com/yourusername/ecommerce.git
cd ecommerce/backend

# 安装依赖
npm install

# 创建生产环境配置文件
cp .env.example .env
nano .env

# 修改.env文件内容
NODE_ENV=production
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=ecommerce
DB_USER=ecommerce_user
DB_PASSWORD=your_strong_password
JWT_SECRET=your_very_strong_jwt_secret
FRONTEND_URL=https://yourdomain.com

# 构建项目
npm run build

# 初始化数据库
mysql -u ecommerce_user -p ecommerce < ../database/init.sql

# 使用PM2启动
pm2 start dist/app.js --name ecommerce-api

# 设置开机自启
pm2 startup
pm2 save
```

### 6. 部署前端

```bash
# 进入前端目录
cd ../frontend

# 安装依赖
npm install

# 创建环境变量文件
cp .env.example .env.production
nano .env.production

# 修改内容
VITE_API_BASE_URL=https://api.yourdomain.com
VITE_APP_TITLE=电商商城

# 构建项目
npm run build

# 复制构建文件到Nginx目录
sudo cp -r dist/* /var/www/html/
```

### 7. 配置Nginx

```bash
# 创建Nginx配置文件
sudo nano /etc/nginx/sites-available/ecommerce
```

```nginx
# 前端配置
server {
    listen 80;
    server_name yourdomain.com;
    root /var/www/html;
    index index.html;

    # 前端路由支持
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 静态文件缓存
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # API代理
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # 文件上传目录
    location /uploads/ {
        proxy_pass http://localhost:3000;
    }

    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}

# API子域名配置（可选）
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# 启用站点
sudo ln -s /etc/nginx/sites-available/ecommerce /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default

# 测试配置
sudo nginx -t

# 重启Nginx
sudo systemctl restart nginx
```

### 8. 配置SSL证书（HTTPS）

```bash
# 安装Certbot
sudo apt install -y certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d yourdomain.com -d api.yourdomain.com

# 自动续期测试
sudo certbot renew --dry-run
```

### 9. 防火墙配置

```bash
# 配置UFW防火墙
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw allow 3000  # 后端端口
sudo ufw enable
sudo ufw status
```

### 10. 监控和日志

```bash
# 查看PM2日志
pm2 logs ecommerce-api

# 查看Nginx日志
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# 查看系统资源
htop
```

## 数据库备份

```bash
# 创建备份脚本
sudo nano /usr/local/bin/backup-db.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/mysql"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="ecommerce"
DB_USER="ecommerce_user"
DB_PASS="your_strong_password"

mkdir -p $BACKUP_DIR
mysqldump -u$DB_USER -p$DB_PASS $DB_NAME | gzip > $BACKUP_DIR/${DB_NAME}_${DATE}.sql.gz

# 删除7天前的备份
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete
```

```bash
# 设置权限
sudo chmod +x /usr/local/bin/backup-db.sh

# 添加到crontab（每天凌晨2点备份）
sudo crontab -e
# 添加：0 2 * * * /usr/local/bin/backup-db.sh
```

## 故障排除

### 常见问题

1. **Node.js应用无法启动**
   ```bash
   # 检查端口占用
   sudo lsof -i :3000
   
   # 检查日志
   pm2 logs ecommerce-api
   
   # 重启应用
   pm2 restart ecommerce-api
   ```

2. **数据库连接失败**
   ```bash
   # 检查MySQL服务状态
   sudo systemctl status mysql
   
   # 检查用户权限
   mysql -u ecommerce_user -p -e "SHOW GRANTS;"
   ```

3. **Nginx配置错误**
   ```bash
   # 测试配置
   sudo nginx -t
   
   # 查看错误日志
   sudo tail -f /var/log/nginx/error.log
   ```

4. **内存不足**
   ```bash
   # 查看内存使用
   free -h
   
   # 增加swap空间
   sudo fallocate -l 2G /swapfile
   sudo chmod 600 /swapfile
   sudo mkswap /swapfile
   sudo swapon /swapfile
   echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
   ```

### 性能优化

1. **数据库优化**
   ```sql
   -- 添加索引
   ALTER TABLE products ADD INDEX idx_category_price (category_id, price);
   ALTER TABLE orders ADD INDEX idx_user_status (user_id, status);
   
   -- 优化查询
   ANALYZE TABLE products;
   OPTIMIZE TABLE orders;
   ```

2. **Node.js优化**
   ```bash
   # 增加PM2实例数（根据CPU核心数）
   pm2 scale ecommerce-api 4
   
   # 启用集群模式
   pm2 start dist/app.js -i max --name ecommerce-api
   ```

3. **Nginx优化**
   ```nginx
   # 启用gzip压缩
   gzip on;
   gzip_vary on;
   gzip_min_length 1024;
   gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
   
   # 启用缓存
   proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=api_cache:10m max_size=1g inactive=60m;
   ```

## 更新部署

```bash
# 拉取最新代码
cd /var/www/ecommerce
git pull origin main

# 更新后端
cd backend
npm install
npm run build
pm2 restart ecommerce-api

# 更新前端
cd ../frontend
npm install
npm run build
sudo cp -r dist/* /var/www/html/
```

## 安全建议

1. **定期更新**
   ```bash
   sudo apt update && sudo apt upgrade -y
   sudo npm update -g
   ```

2. **安全扫描**
   ```bash
   # 安装安全扫描工具
   npm audit
   sudo apt install lynis
   sudo lynis audit system
   ```

3. **监控告警**
   - 设置服务器监控（CPU、内存、磁盘）
   - 配置日志告警
   - 定期检查安全日志

4. **备份策略**
   - 数据库每日备份
   - 代码仓库备份
   - 配置文件备份

## 扩展部署

### Docker部署
```dockerfile
# Dockerfile示例
FROM node:18-alpine as backend
WORKDIR /app
COPY backend/package*.json ./
RUN npm ci --only=production
COPY backend .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY --from=backend /app/dist ./dist
COPY --from=backend /app/node_modules ./node_modules
EXPOSE 3000
CMD ["node", "dist/app.js"]
```

### Kubernetes部署
```yaml
# deployment.yaml示例
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ecommerce-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: ecommerce-api
  template:
    metadata:
      labels:
        app: ecommerce-api
    spec:
      containers:
      - name: api
        image: yourregistry/ecommerce-api:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
```

---

**注意**: 生产环境部署前请务必进行充分测试，并确保所有敏感信息（密码、密钥等）已正确配置。