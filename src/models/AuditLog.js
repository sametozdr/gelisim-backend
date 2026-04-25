const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AuditLog = sequelize.define('AuditLog', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  action: {
    type: DataTypes.ENUM('CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT'),
    allowNull: false,
  },
  table_name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  record_id: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  old_value: {
    type: DataTypes.JSONB,
    allowNull: true,
  },
  new_value: {
    type: DataTypes.JSONB,
    allowNull: true,
  },
  ip_address: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  tableName: 'audit_logs',
  timestamps: true,
  updatedAt: false, // Audit logs usually don't get updated
  paranoid: false, // Audit logs should never be deleted, even softly
});

module.exports = AuditLog;
