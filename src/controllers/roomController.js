const { Room } = require('../models');
const { logActivity } = require('../utils/auditLogger');

exports.getRooms = async (req, res, next) => {
  try {
    const rooms = await Room.findAll();
    res.json({ success: true, data: rooms });
  } catch (error) {
    next(error);
  }
};

exports.getRoomById = async (req, res, next) => {
  try {
    const room = await Room.findByPk(req.params.id);
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }
    res.json({ success: true, data: room });
  } catch (error) {
    next(error);
  }
};

exports.createRoom = async (req, res, next) => {
  try {
    const room = await Room.create(req.body);
    
    await logActivity({
      userId: req.user.id,
      action: 'CREATE',
      tableName: 'rooms',
      recordId: room.id,
      newValue: room.toJSON(),
      ipAddress: req.ip
    });

    res.status(201).json({ success: true, data: room });
  } catch (error) {
    next(error);
  }
};

exports.updateRoom = async (req, res, next) => {
  try {
    const room = await Room.findByPk(req.params.id);
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    const oldValue = room.toJSON();
    await room.update(req.body);
    
    await logActivity({
      userId: req.user.id,
      action: 'UPDATE',
      tableName: 'rooms',
      recordId: room.id,
      oldValue,
      newValue: room.toJSON(),
      ipAddress: req.ip
    });

    res.json({ success: true, data: room });
  } catch (error) {
    next(error);
  }
};

exports.deleteRoom = async (req, res, next) => {
  try {
    const room = await Room.findByPk(req.params.id);
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    await room.destroy();
    
    await logActivity({
      userId: req.user.id,
      action: 'DELETE',
      tableName: 'rooms',
      recordId: room.id,
      oldValue: room.toJSON(),
      ipAddress: req.ip
    });

    res.json({ success: true, message: 'Room deleted successfully' });
  } catch (error) {
    next(error);
  }
};
