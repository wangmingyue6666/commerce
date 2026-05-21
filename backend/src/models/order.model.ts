import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import User from './user.model';
import Product from './product.model';

// 订单状态枚举
export enum OrderStatus {
  PENDING = 'pending',      // 待支付
  PAID = 'paid',            // 已支付
  SHIPPED = 'shipped',      // 已发货
  DELIVERED = 'delivered',  // 已送达
  COMPLETED = 'completed',  // 已完成
  CANCELLED = 'cancelled',  // 已取消
  REFUNDED = 'refunded'     // 已退款
}

// 支付方式枚举
export enum PaymentMethod {
  ALIPAY = 'alipay',        // 支付宝
  WECHAT = 'wechat',        // 微信支付
  BANK = 'bank',            // 银行卡
  CASH = 'cash'             // 现金
}

// 订单属性接口
interface OrderAttributes {
  id: number;
  order_no: string;
  user_id: number;
  total_amount: number;
  discount_amount: number;
  shipping_fee: number;
  final_amount: number;
  payment_method: PaymentMethod;
  payment_status: number; // 0-未支付, 1-已支付
  status: OrderStatus;
  shipping_address: string;
  receiver: string;
  receiver_phone: string;
  note?: string;
  paid_at?: Date;
  shipped_at?: Date;
  delivered_at?: Date;
  completed_at?: Date;
  cancelled_at?: Date;
  created_at: Date;
  updated_at: Date;
}

// 创建时的可选属性
interface OrderCreationAttributes extends Optional<OrderAttributes, 
  'id' | 'discount_amount' | 'shipping_fee' | 'final_amount' | 
  'payment_status' | 'created_at' | 'updated_at'> {}

// 订单模型类
class Order extends Model<OrderAttributes, OrderCreationAttributes> implements OrderAttributes {
  public id!: number;
  public order_no!: string;
  public user_id!: number;
  public total_amount!: number;
  public discount_amount!: number;
  public shipping_fee!: number;
  public final_amount!: number;
  public payment_method!: PaymentMethod;
  public payment_status!: number;
  public status!: OrderStatus;
  public shipping_address!: string;
  public receiver!: string;
  public receiver_phone!: string;
  public note?: string;
  public paid_at?: Date;
  public shipped_at?: Date;
  public delivered_at?: Date;
  public completed_at?: Date;
  public cancelled_at?: Date;
  public created_at!: Date;
  public updated_at!: Date;

  // 关联用户
  public user?: User;
  
  // 关联订单项
  public items?: OrderItem[];

  // 计算最终金额
  public calculateFinalAmount(): void {
    this.final_amount = this.total_amount - this.discount_amount + this.shipping_fee;
  }

  // 检查是否可以取消
  public canCancel(): boolean {
    return this.status === OrderStatus.PENDING || this.status === OrderStatus.PAID;
  }

  // 检查是否可以发货
  public canShip(): boolean {
    return this.status === OrderStatus.PAID;
  }

  // 检查是否可以确认收货
  public canDeliver(): boolean {
    return this.status === OrderStatus.SHIPPED;
  }

  // 检查是否可以完成
  public canComplete(): boolean {
    return this.status === OrderStatus.DELIVERED;
  }
}

Order.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    order_no: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    total_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0
      }
    },
    discount_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    shipping_fee: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    final_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    payment_method: {
      type: DataTypes.ENUM(...Object.values(PaymentMethod)),
      allowNull: false,
      defaultValue: PaymentMethod.ALIPAY
    },
    payment_status: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 0, // 0-未支付, 1-已支付
      validate: {
        isIn: [[0, 1]]
      }
    },
    status: {
      type: DataTypes.ENUM(...Object.values(OrderStatus)),
      allowNull: false,
      defaultValue: OrderStatus.PENDING
    },
    shipping_address: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    receiver: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    receiver_phone: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    note: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    paid_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    shipped_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    delivered_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    completed_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    cancelled_at: {
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
    tableName: 'orders',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        fields: ['user_id']
      },
      {
        fields: ['order_no']
      },
      {
        fields: ['status']
      },
      {
        fields: ['created_at']
      }
    ]
  }
);

// 订单项模型
interface OrderItemAttributes {
  id: number;
  order_id: number;
  product_id: number;
  product_name: string;
  product_image?: string;
  price: number;
  quantity: number;
  subtotal: number;
  created_at: Date;
  updated_at: Date;
}

interface OrderItemCreationAttributes extends Optional<OrderItemAttributes, 'id' | 'created_at' | 'updated_at'> {}

class OrderItem extends Model<OrderItemAttributes, OrderItemCreationAttributes> implements OrderItemAttributes {
  public id!: number;
  public order_id!: number;
  public product_id!: number;
  public product_name!: string;
  public product_image?: string;
  public price!: number;
  public quantity!: number;
  public subtotal!: number;
  public created_at!: Date;
  public updated_at!: Date;

  // 关联订单
  public order?: Order;
  // 关联商品
  public product?: Product;
}

OrderItem.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    order_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'orders',
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
    product_name: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    product_image: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0
      }
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1
      }
    },
    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0
      }
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
    tableName: 'order_items',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        fields: ['order_id']
      },
      {
        fields: ['product_id']
      }
    ]
  }
);

// 定义关联
Order.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
});

User.hasMany(Order, {
  foreignKey: 'user_id',
  as: 'orders'
});

Order.hasMany(OrderItem, {
  foreignKey: 'order_id',
  as: 'items'
});

OrderItem.belongsTo(Order, {
  foreignKey: 'order_id',
  as: 'order'
});

OrderItem.belongsTo(Product, {
  foreignKey: 'product_id',
  as: 'product'
});

Product.hasMany(OrderItem, {
  foreignKey: 'product_id',
  as: 'order_items'
});

export { Order, OrderItem };