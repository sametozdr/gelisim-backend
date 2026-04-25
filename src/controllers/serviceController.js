const { Service } = require('../models');
const { logActivity } = require('../utils/auditLogger');

exports.getServices = async (req, res, next) => {
  try {
    const services = await Service.findAll({ where: { is_active: true } });
    res.json({ success: true, data: services });
  } catch (error) {
    next(error);
  }
};

exports.createService = async (req, res, next) => {
  try {
    const service = await Service.create(req.body);
    
    await logActivity({
      userId: req.user.id,
      action: 'CREATE',
      tableName: 'services',
      recordId: service.id,
      newValue: service.toJSON(),
      ipAddress: req.ip
    });

    res.status(201).json({ success: true, data: service });
  } catch (error) {
    next(error);
  }
};

exports.updateService = async (req, res, next) => {
  try {
    const service = await Service.findByPk(req.params.id);
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    const oldValue = service.toJSON();
    await service.update(req.body);
    
    await logActivity({
      userId: req.user.id,
      action: 'UPDATE',
      tableName: 'services',
      recordId: service.id,
      oldValue,
      newValue: service.toJSON(),
      ipAddress: req.ip
    });

    res.json({ success: true, data: service });
  } catch (error) {
    next(error);
  }
};
