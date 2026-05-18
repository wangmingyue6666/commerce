import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

// 商品属性接口
interface ProductAttributes {
  id: number;
  name: string;
  category_id: number;
  brand?: string;
  price: number;
  market_price?: number;
  stock: number;
  sales: number;
  main_image?: string;
  images?: string;
  description?: string;
  detail?: string;
  status: number;
  deleted_at?: Date;
  created_at: Date;
  updated_at: Date;
}

// 创建时的可选属性
interface ProductCreationAttributes extends Optional<ProductAttributes, 'id' | 'sales' | 'created_at' | 'updated_at'> {}

// 商品模型类
class Product extends Model<ProductAttributes, ProductCreationAttributes> implements ProductAttributes {
  public id!: number;
  public name!: string;
  public category_id!: number;
  public brand?: string;
  public price!: number;
  public market_price?: number;
  public stock!: number;
  public sales!: number;
  public main_image?: string;
  public images?: string;
  public description?: string;
  public detail?: string;
  public status!: number;
  public deleted_at?: Date;
  public created_at!: Date;
  public updated_at!: Date;

  // 关联分类暂时移除，后续可添加
  public category?: any;

  // 获取图片数组
  public getImagesArray(): string[] {
    try {
      return this.images ? JSON.parse(this.images) : [];
    } catch {
      return [];
    }
  }

  // 设置图片数组
  public setImagesArray(images: string[]): void {
    this.images = JSON.stringify(images);
  }

  // 检查是否有库存
  public hasStock(quantity: number): boolean {
    return this.stock >= quantity;
  }

  // 减少库存
  public decreaseStock(quantity: number): void {
    if (this.hasStock(quantity)) {
      this.stock -= quantity;
      this.sales += quantity;
    } else {
      throw new Error('库存不足');
    }
  }

  // 增加库存
  public increaseStock(quantity: number): void {
    this.stock += quantity;
  }
}

Product.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(200),
      allowNull: false,
      validate: {
        len: [1, 200]
      }
    },
    category_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'categories',
        key: 'id'
      }
    },
    brand: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0
      }
    },
    market_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      validate: {
        min: 0
      }
    },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    sales: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    main_image: {
      type: DataTypes.TEXT('long'),
      allowNull: true
    },
    images: {
      type: DataTypes.TEXT('long'),
      allowNull: true,
      set(value: string[] | string) {
        if (Array.isArray(value)) {
          this.setDataValue('images', JSON.stringify(value));
        } else if (typeof value === 'string') {
          // 尝试解析字符串，如果是有效的JSON则存储解析后的值
          try {
            const parsed = JSON.parse(value);
            if (Array.isArray(parsed)) {
              this.setDataValue('images', value);
            } else {
              this.setDataValue('images', JSON.stringify([]));
            }
          } catch {
            // 如果不是有效的JSON，存储为空数组
            this.setDataValue('images', JSON.stringify([]));
          }
        } else {
          this.setDataValue('images', JSON.stringify([]));
        }
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    detail: {
      type: DataTypes.TEXT('long'),
      allowNull: true
    },
    status: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1, // 0-下架, 1-上架
      validate: {
        isIn: [[0, 1]]
      }
    },
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true
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
    tableName: 'products',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        fields: ['category_id']
      },
      {
        fields: ['price']
      },
      {
        fields: ['sales']
      },
      {
        type: 'FULLTEXT',
        fields: ['name']
      }
    ]
  }
);

// 关联关系暂时移除，后续可添加

export default Product;