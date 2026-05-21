import bcrypt from 'bcryptjs';
import sequelize from '../src/config/database';

async function resetPassword() {
  try {
    await sequelize.authenticate();
    console.log('Connected to database');
    
    const hash = await bcrypt.hash('password123', 10);
    console.log('Generated hash:', hash);
    
    await sequelize.query("UPDATE users SET password = ? WHERE username = 'admin'", {
      replacements: [hash]
    });
    
    console.log('Password updated successfully');
    await sequelize.close();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

resetPassword();