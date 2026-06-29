import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/sequelize';

export class UserEntity extends Model {}
UserEntity.init({
  id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING(120), allowNull: false },
  email: { type: DataTypes.STRING(190), allowNull: false, unique: true },
  password: { type: DataTypes.STRING(255), allowNull: false },
  avatar: { type: DataTypes.STRING(255), defaultValue: '' },
  businessName: { type: DataTypes.STRING(160), field: 'business_name', defaultValue: '' },
  phone: { type: DataTypes.STRING(40), defaultValue: '' },
  role: { type: DataTypes.ENUM('user', 'admin'), defaultValue: 'user' },
  resetPasswordToken: { type: DataTypes.STRING(255), field: 'reset_password_token', defaultValue: null, allowNull: true },
  resetPasswordExpire: { type: DataTypes.DATE, field: 'reset_password_expire', defaultValue: null, allowNull: true },
  createdAt: { type: DataTypes.DATE, field: 'created_at' },
}, {
  sequelize,
  tableName: 'users',
  timestamps: false,
});

export class ClientEntity extends Model {}
ClientEntity.init({
  id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  userId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'user_id' },
  name: { type: DataTypes.STRING(160), allowNull: false },
  companyName: { type: DataTypes.STRING(160), field: 'company_name' },
  email: { type: DataTypes.STRING(190) },
  phone: { type: DataTypes.STRING(40) },
  address: { type: DataTypes.TEXT },
  createdAt: { type: DataTypes.DATE, field: 'created_at' },
}, {
  sequelize,
  tableName: 'clients',
  timestamps: false,
});

export class ProductEntity extends Model {}
ProductEntity.init({
  id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  userId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'user_id' },
  name: { type: DataTypes.STRING(160), allowNull: false },
  price: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
  description: { type: DataTypes.TEXT },
  sku: { type: DataTypes.STRING(80) },
  quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  image: { type: DataTypes.STRING(255) },
  createdAt: { type: DataTypes.DATE, field: 'created_at' },
}, {
  sequelize,
  tableName: 'products',
  timestamps: false,
});

export class InvoiceEntity extends Model {}
InvoiceEntity.init({
  id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  userId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'user_id' },
  clientId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'client_id' },
  invoiceNumber: { type: DataTypes.STRING(40), allowNull: false, unique: true, field: 'invoice_number' },
  status: { type: DataTypes.ENUM('Draft', 'Paid', 'Unpaid', 'Pending', 'Overdue'), defaultValue: 'Pending' },
  subtotal: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
  tax: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
  discount: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
  totalAmount: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0, field: 'total_amount' },
  invoiceDate: { type: DataTypes.DATEONLY, allowNull: false, field: 'invoice_date' },
  dueDate: { type: DataTypes.DATEONLY, allowNull: false, field: 'due_date' },
  currency: { type: DataTypes.CHAR(3), defaultValue: 'USD' },
  notes: { type: DataTypes.TEXT },
  createdAt: { type: DataTypes.DATE, field: 'created_at' },
}, {
  sequelize,
  tableName: 'invoices',
  timestamps: false,
});

export class InvoiceItemEntity extends Model {}
InvoiceItemEntity.init({
  id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  invoiceId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'invoice_id' },
  productId: { type: DataTypes.INTEGER.UNSIGNED, field: 'product_id' },
  itemName: { type: DataTypes.STRING(180), allowNull: false, field: 'item_name' },
  quantity: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  price: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
  subtotal: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
}, {
  sequelize,
  tableName: 'invoice_items',
  timestamps: false,
});

UserEntity.hasMany(ClientEntity, { foreignKey: 'user_id' });
UserEntity.hasMany(ProductEntity, { foreignKey: 'user_id' });
UserEntity.hasMany(InvoiceEntity, { foreignKey: 'user_id' });
ClientEntity.belongsTo(UserEntity, { foreignKey: 'user_id' });
ProductEntity.belongsTo(UserEntity, { foreignKey: 'user_id' });
InvoiceEntity.belongsTo(UserEntity, { foreignKey: 'user_id' });
InvoiceEntity.belongsTo(ClientEntity, { foreignKey: 'client_id' });
InvoiceEntity.hasMany(InvoiceItemEntity, { foreignKey: 'invoice_id' });
InvoiceItemEntity.belongsTo(InvoiceEntity, { foreignKey: 'invoice_id' });
InvoiceItemEntity.belongsTo(ProductEntity, { foreignKey: 'product_id' });

export const entities = {
  UserEntity,
  ClientEntity,
  ProductEntity,
  InvoiceEntity,
  InvoiceItemEntity,
};
