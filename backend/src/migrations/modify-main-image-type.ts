import { QueryInterface, DataTypes } from 'sequelize';

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.changeColumn('products', 'main_image', {
      type: DataTypes.TEXT('long'),
      allowNull: true
    });
  },
  down: async (queryInterface: QueryInterface) => {
    await queryInterface.changeColumn('products', 'main_image', {
      type: DataTypes.TEXT,
      allowNull: true
    });
  }
};
