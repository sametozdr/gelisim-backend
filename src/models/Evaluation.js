const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Evaluation = sequelize.define('Evaluation', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  appointment_id: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true,
  },
  client_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  consultant_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  scores: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {},
    comment: 'Generic scores like { concentration: 4, compliance: 5 }',
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  next_target: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  confidentiality_level: {
    type: DataTypes.ENUM('Normal', 'Private'),
    defaultValue: 'Normal',
  },
}, {
  tableName: 'evaluations',
  paranoid: true,
});

module.exports = Evaluation;
