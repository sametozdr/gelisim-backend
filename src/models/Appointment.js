const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Appointment = sequelize.define('Appointment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  client_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  consultant_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  room_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  service_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  package_id: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  start_time: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  end_time: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('Planned', 'Completed', 'Cancelled', 'NoShow'),
    defaultValue: 'Planned',
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'appointments',
  paranoid: true,
  indexes: [
    {
      fields: ['start_time', 'end_time'],
    },
    {
      fields: ['consultant_id'],
    },
    {
      fields: ['room_id'],
    },
  ],
});

module.exports = Appointment;
