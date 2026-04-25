const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ClientPackage = sequelize.define('ClientPackage', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  client_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  service_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  total_sessions: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
  },
  used_sessions: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  total_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
  },
  balance_due: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
  },
  status: {
    type: DataTypes.ENUM('Active', 'Completed', 'Cancelled'),
    defaultValue: 'Active',
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'client_packages',
  paranoid: true,
});

module.exports = ClientPackage;
