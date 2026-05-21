import sequelize from '../src/config/database';
import Product from '../src/models/product.model';

async function listProducts() {
  await sequelize.authenticate();
  const products = await Product.findAll({ attributes: ['id', 'name', 'stock'] });
  console.log('Available products:');
  products.forEach(p => console.log(`ID: ${p.id}, Name: ${p.name}, Stock: ${p.stock}`));
  await sequelize.close();
}

listProducts();