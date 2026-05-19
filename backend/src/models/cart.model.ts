import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import User from './user.model';
import Product from './product.model';

// 购物车项属性接口
interface CartItemAttributes {
  id: number;
  user_id: number;
  product_id: number;
  quantity: number;
  checked: boolean;
  created_at: Date;
  updated_at: Date;
}

// 创建时的可选属性
interface CartItemCreationAttributes extends Optional<CartItemAttributes, 'id' | 'checked' | 'created_at' | 'updated_at'> {}

// 购物车模型类
class CartItem extends Model<CartItemAttributes, CartItemCreationAttributes> implements CartItemAttributes {
  public id!: number;
  public user_id!: number;
  public product_id!: number;
  public quantity!: number;
  public checked!: boolean;
  public created_at!: Date;
  public updated_at!: Date;

  // 关联用户
  public user?: User;
  
  // 关联商品
  public product?: Product;
}

CartItem.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'products',
        key: 'id'
      }
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        min: 1
      }
    },
    checked: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  },
  {
    sequelize,
    tableName: 'cart_items',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        fields: ['user_id']
      },
      {
        fields: ['product_id']
      },
      {
        fields: ['user_id', 'product_id'],
        unique: true
      }
    ]
  }
);

// 定义关联
CartItem.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
});

CartItem.belongsTo(Product, {
  foreignKey: 'product_id',
  as: 'product'
});

User.hasMany(CartItem, {
  foreignKey: 'user_id',
  as: 'cart_items'
});

export default CartItem;
