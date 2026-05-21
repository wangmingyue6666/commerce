const { exec } = require('child_process');

let attempt = 0;
const maxAttempts = -1; // -1表示无限尝试
const intervalMinutes = 5;

function tryPush() {
  attempt++;
  console.log(`\n=== 第 ${attempt} 次尝试推送 (${new Date().toLocaleString()}) ===`);
  
  exec('git push origin master', { cwd: 'd:\\workspace\\commerce' }, (error, stdout, stderr) => {
    if (error) {
      console.log('❌ 推送失败:', error.message);
      console.log('stderr:', stderr);
      
      if (maxAttempts === -1 || attempt < maxAttempts) {
        console.log(`\n⏳ ${intervalMinutes} 分钟后再次尝试...`);
        setTimeout(tryPush, intervalMinutes * 60 * 1000);
      } else {
        console.log('\n已达到最大尝试次数，停止尝试。');
      }
      return;
    }
    
    console.log('✅ 推送成功!');
    console.log('stdout:', stdout);
  });
}

console.log(`🚀 开始定时推送任务，每隔 ${intervalMinutes} 分钟尝试一次...`);
tryPush();