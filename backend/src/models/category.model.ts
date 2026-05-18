import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface CategoryAttributes {
  id: number;
  name: string;
  parent_id: number;
  level: number;
  sort: number;
  icon?: string;
  status: number;
  created_at: Date;
  updated_at: Date;
}

interface CategoryCreationAttributes extends Optional<CategoryAttributes, 'id' | 'created_at' | 'updated_at'> {}

class Category extends Model<CategoryAttributes, CategoryCreationAttributes> implements CategoryAttributes {
  public id!: number;
  public name!: string;
  public parent_id!: number;
  public level!: number;
  public sort!: number;
  public icon?: string;
  public status!: number;
  public created_at!: Date;
  public updated_at!: Date;
}

Category.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '分类名称'
    },
    parent_id: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '父分类ID'
    },
    level: {
      type: DataTypes.TINYINT,
      defaultValue: 1,
      comment: '分类层级'
    },
    sort: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '排序'
    },
    icon: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: '图标'
    },
    status: {
      type: DataTypes.TINYINT,
      defaultValue: 1,
      comment: '状态: 0-禁用, 1-启用'
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
    tableName: 'categories',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
);

export default Category;