const { Client, ClientDocument } = require('../models');
const { logActivity } = require('../utils/auditLogger');

exports.getClients = async (req, res, next) => {
  try {
    const clients = await Client.findAll();
    res.json({ success: true, data: clients });
  } catch (error) {
    next(error);
  }
};

exports.getClientById = async (req, res, next) => {
  try {
    const client = await Client.findByPk(req.params.id, {
      include: [{ model: ClientDocument }]
    });
    if (!client) {
      return res.status(404).json({ success: false, message: 'Client not found' });
    }
    res.json({ success: true, data: client });
  } catch (error) {
    next(error);
  }
};

exports.createClient = async (req, res, next) => {
  try {
    const client = await Client.create(req.body);
    
    await logActivity({
      userId: req.user.id,
      action: 'CREATE',
      tableName: 'clients',
      recordId: client.id,
      newValue: client.toJSON(),
      ipAddress: req.ip
    });

    res.status(201).json({ success: true, data: client });
  } catch (error) {
    next(error);
  }
};

exports.updateClient = async (req, res, next) => {
  try {
    const client = await Client.findByPk(req.params.id);
    if (!client) {
      return res.status(404).json({ success: false, message: 'Client not found' });
    }

    const oldValue = client.toJSON();
    await client.update(req.body);
    
    await logActivity({
      userId: req.user.id,
      action: 'UPDATE',
      tableName: 'clients',
      recordId: client.id,
      oldValue,
      newValue: client.toJSON(),
      ipAddress: req.ip
    });

    res.json({ success: true, data: client });
  } catch (error) {
    next(error);
  }
};

exports.deleteClient = async (req, res, next) => {
  try {
    const client = await Client.findByPk(req.params.id);
    if (!client) {
      return res.status(404).json({ success: false, message: 'Client not found' });
    }

    const oldValue = client.toJSON();
    await client.destroy(); // Soft delete via Paranoind

    await logActivity({
      userId: req.user.id,
      action: 'DELETE',
      tableName: 'clients',
      recordId: client.id,
      oldValue,
      newValue: null,
      ipAddress: req.ip
    });

    res.json({ success: true, message: 'Danışan başarıyla silindi' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.parent ? error.parent.detail || error.message : error.message });
  }
};

// Document management (Linking Firebase Storage URLs)
exports.addDocument = async (req, res, next) => {
  try {
    const { client_id, file_name, file_url, file_type } = req.body;
    
    const document = await ClientDocument.create({
      client_id,
      file_name,
      file_url,
      file_type,
      uploaded_by: req.user.id
    });

    await logActivity({
      userId: req.user.id,
      action: 'CREATE',
      tableName: 'client_documents',
      recordId: document.id,
      newValue: document.toJSON(),
      ipAddress: req.ip
    });

    res.status(201).json({ success: true, data: document });
  } catch (error) {
    next(error);
  }
};
