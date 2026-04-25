const { ClientPackage, Service, Client } = require('../models');
const { logActivity } = require('../utils/auditLogger');

exports.createPackage = async (req, res, next) => {
  try {
    const { client_id, service_id, total_sessions, total_price, amount_paid } = req.body;
    
    const balance_due = total_price - (amount_paid || 0);

    const pkg = await ClientPackage.create({
      client_id,
      service_id,
      total_sessions,
      used_sessions: 0,
      total_price,
      balance_due,
      status: 'Active'
    });

    await logActivity({
      userId: req.user.id,
      action: 'CREATE',
      tableName: 'client_packages',
      recordId: pkg.id,
      newValue: pkg.toJSON(),
      ipAddress: req.ip
    });

    res.status(201).json({ success: true, data: pkg });
  } catch (error) {
    next(error);
  }
};

exports.getAllPackages = async (req, res, next) => {
  try {
    const packages = await ClientPackage.findAll({
      include: [
        { model: Service, attributes: ['name'] },
        { model: Client, attributes: ['full_name'] }
      ]
    });
    // Format response to match frontend expectations (total_sessions, remaining_sessions=total-used, price)
    const formattedData = packages.map(p => {
      const data = p.toJSON();
      data.remaining_sessions = data.total_sessions - data.used_sessions;
      data.price = data.total_price;
      // Sequelize uses the raw Model name when 'as' alias isn't provided
      data.client = data.Client; 
      data.service = data.Service;
      return data;
    });
    res.json({ success: true, data: formattedData });
  } catch (error) {
    next(error);
  }
};

exports.getClientPackages = async (req, res, next) => {
  try {
    const packages = await ClientPackage.findAll({
      where: { client_id: req.params.clientId },
      include: [{ model: Service, attributes: ['name'] }]
    });
    res.json({ success: true, data: packages });
  } catch (error) {
    next(error);
  }
};

exports.updatePayment = async (req, res, next) => {
  try {
    const { amount } = req.body;
    const pkg = await ClientPackage.findByPk(req.params.id);

    if (!pkg) {
      return res.status(404).json({ success: false, message: 'Paket bulunamadı' });
    }

    const oldValue = pkg.toJSON();
    pkg.balance_due = pkg.balance_due - amount;
    await pkg.save();

    await logActivity({
      userId: req.user.id,
      action: 'UPDATE',
      tableName: 'client_packages',
      recordId: pkg.id,
      oldValue,
      newValue: pkg.toJSON(),
      ipAddress: req.ip
    });

    res.json({ success: true, data: pkg });
  } catch (error) {
    next(error);
  }
};

exports.extendPackage = async (req, res, next) => {
  try {
    const { additional_sessions, additional_price } = req.body;
    const pkg = await ClientPackage.findByPk(req.params.id);

    if (!pkg) {
      return res.status(404).json({ success: false, message: 'Paket bulunamadı' });
    }

    const oldValue = pkg.toJSON();
    
    // Add new parameters to existing plan limits
    pkg.total_sessions = pkg.total_sessions + parseInt(additional_sessions || 0);
    pkg.total_price = parseFloat(pkg.total_price) + parseFloat(additional_price || 0);
    pkg.balance_due = parseFloat(pkg.balance_due) + parseFloat(additional_price || 0);
    
    // Re-activate if it was completed
    if (pkg.status === 'Completed' && pkg.used_sessions < pkg.total_sessions) {
      pkg.status = 'Active';
    }

    await pkg.save();

    const { logActivity } = require('../utils/auditLogger');
    await logActivity({
      userId: req.user.id,
      action: 'UPDATE',
      tableName: 'client_packages',
      recordId: pkg.id,
      oldValue,
      newValue: pkg.toJSON(),
      ipAddress: req.ip
    });

    res.json({ success: true, data: pkg });
  } catch (error) {
    next(error);
  }
};

exports.deletePackage = async (req, res, next) => {
  try {
    const pkg = await ClientPackage.findByPk(req.params.id);
    if (!pkg) {
      return res.status(404).json({ success: false, message: 'Paket bulunamadı' });
    }

    const { logActivity } = require('../utils/auditLogger');
    const oldValue = pkg.toJSON();
    
    await pkg.destroy();

    await logActivity({
      userId: req.user.id,
      action: 'DELETE',
      tableName: 'client_packages',
      recordId: pkg.id,
      oldValue,
      newValue: null,
      ipAddress: req.ip
    });

    res.json({ success: true, message: 'Borç / Paket silindi' });
  } catch (error) {
    next(error);
  }
};
