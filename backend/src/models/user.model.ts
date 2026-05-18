import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import bcrypt from 'bcryptjs';

// 用户属性接口
interface UserAttributes {
  id: number;
  username: string;
  password: string;
  email?: string;
  phone?: string;
  avatar?: string;
  nickname?: string;
  gender?: number;
  birthday?: Date;
  status: number;
  last_login?: Date;
  created_at: Date;
  updated_at: Date;
}

// 创建时的可选属性
interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'created_at' | 'updated_at'> {}

// 用户模型类
class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: number;
  public username!: string;
  public password!: string;
  public email?: string;
  public phone?: string;
  public avatar?: string;
  public nickname?: string;
  public gender?: number;
  public birthday?: Date;
  public status!: number;
  public last_login?: Date;
  public created_at!: Date;
  public updated_at!: Date;

  // 验证密码
  public async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }

  // 转换为JSON时排除密码
  public toJSON(): any {
    const values = this.get();
    const { password, ...safeValues } = values;
    return safeValues;
  }
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: {
        len: [3, 50]
      }
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        len: [6, 255]
      }
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: true,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
      validate: {
        is: /^1[3-9]\d{9}$/
      }
    },
    avatar: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    nickname: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    gender: {
      type: DataTypes.TINYINT,
      allowNull: true,
      defaultValue: 0,
      validate: {
        isIn: [[0, 1, 2]] // 0-未知, 1-男, 2-女
      }
    },
    birthday: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    status: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1, // 0-禁用, 1-正常
      validate: {
        isIn: [[0, 1]]
      }
    },
    last_login: {
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
    tableName: 'users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    hooks: {
      beforeCreate: async (user: User) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
      beforeUpdate: async (user: User) => {
        if (user.changed('password')) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      }
    },
    indexes: [
      {
        unique: true,
        fields: ['username']
      },
      {
        unique: true,
        fields: ['email']
      },
      {
        fields: ['phone']
      }
    ]
  }
);

export default User;