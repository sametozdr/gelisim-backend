const sequelize = require('../config/database');
const User = require('./User');
const Room = require('./Room');
const Client = require('./Client');
const Service = require('./Service');
const ClientPackage = require('./ClientPackage');
const Appointment = require('./Appointment');
const Evaluation = require('./Evaluation');
const AuditLog = require('./AuditLog');
const ClientDocument = require('./ClientDocument');

// Relationships

// User & Appointments (Consultant)
User.hasMany(Appointment, { foreignKey: 'consultant_id' });
Appointment.belongsTo(User, { foreignKey: 'consultant_id', as: 'consultant' });

// Client & Appointments
Client.hasMany(Appointment, { foreignKey: 'client_id' });
Appointment.belongsTo(Client, { foreignKey: 'client_id', as: 'client' });

// Room & Appointments
Room.hasMany(Appointment, { foreignKey: 'room_id' });
Appointment.belongsTo(Room, { foreignKey: 'room_id', as: 'room' });

// Service & Appointments
Service.hasMany(Appointment, { foreignKey: 'service_id' });
Appointment.belongsTo(Service, { foreignKey: 'service_id', as: 'service' });

// Client & Packages
Client.hasMany(ClientPackage, { foreignKey: 'client_id' });
ClientPackage.belongsTo(Client, { foreignKey: 'client_id' });

// Service & Packages
Service.hasMany(ClientPackage, { foreignKey: 'service_id' });
ClientPackage.belongsTo(Service, { foreignKey: 'service_id' });

// Appointment & Package
ClientPackage.hasMany(Appointment, { foreignKey: 'package_id' });
Appointment.belongsTo(ClientPackage, { foreignKey: 'package_id', as: 'package' });

// Appointment & Evaluation
Appointment.hasOne(Evaluation, { foreignKey: 'appointment_id' });
Evaluation.belongsTo(Appointment, { foreignKey: 'appointment_id' });

// Audit Logs
User.hasMany(AuditLog, { foreignKey: 'user_id' });
AuditLog.belongsTo(User, { foreignKey: 'user_id' });

// Client & Documents
Client.hasMany(ClientDocument, { foreignKey: 'client_id' });
ClientDocument.belongsTo(Client, { foreignKey: 'client_id' });

const db = {
  sequelize,
  User,
  Room,
  Client,
  Service,
  ClientPackage,
  Appointment,
  Evaluation,
  AuditLog,
  ClientDocument,
};

module.exports = db;
