const { exec } = require('child_process');

async function killPort(port) {
  return new Promise((resolve) => {
    // 查找占用端口的进程
    exec(`netstat -ano | findstr :${port}`, (err, stdout) => {
      if (err) {
        resolve(false);
        return;
      }
      
      const lines = stdout.trim().split('\n');
      const pids = new Set();
      
      lines.forEach(line => {
        const parts = line.trim().split(/\s+/);
        const pid = parts[parts.length - 1];
        if (pid && !isNaN(pid)) {
          pids.add(pid);
        }
      });
      
      if (pids.size === 0) {
        resolve(false);
        return;
      }
      
      console.log(`发现端口 ${port} 被进程占用: ${Array.from(pids).join(', ')}`);
      
      let killedCount = 0;
      pids.forEach(pid => {
        exec(`taskkill /F /PID ${pid}`, (killErr) => {
          if (!killErr) {
            console.log(`已杀死进程 ${pid}`);
            killedCount++;
          }
          if (killedCount === pids.size) {
            resolve(true);
          }
        });
      });
    });
  });
}

async function startServices() {
  console.log('=== 启动前检查端口占用 ===');
  
  // 检查并释放端口
  await killPort(3000); // 后端端口
  await killPort(8080); // 前端端口
  await killPort(3306); // MySQL端口
  
  console.log('\n=== 端口检查完成 ===\n');
  
  // 启动MySQL
  console.log('启动MySQL...');
  exec(`start cmd /k "cd C:\\Program Files\\MySQL\\MySQL Server 8.4\\bin && mysqld.exe --console --datadir=D:\\workspace\\commerce\\mysql-data"`);
  
  // 等待MySQL启动
  await new Promise(resolve => setTimeout(resolve, 8000));
  
  // 启动后端
  console.log('启动后端服务...');
  exec(`start cmd /k "cd D:\\workspace\\commerce\\backend && npm run dev"`);
  
  // 等待后端启动
  await new Promise(resolve => setTimeout(resolve, 10000));
  
  // 启动前端
  console.log('启动前端服务...');
  exec(`start cmd /k "cd D:\\workspace\\commerce\\frontend && npm run dev"`);
  
  console.log('\n=== 服务启动命令已发出 ===');
  console.log('请等待各服务完全启动后访问 http://localhost:8080');
}

// 如果直接运行此脚本
if (require.main === module) {
  startServices().catch(console.error);
}

module.exports = { killPort, startServices };