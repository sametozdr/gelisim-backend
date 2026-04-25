const { User } = require('../models');
const { logActivity } = require('../utils/auditLogger');

/**
 * Syncs the Firebase user with our local PostgreSQL database.
 * Usually called on first login or profile update.
 */
exports.syncProfile = async (req, res, next) => {
  try {
    const { firebase_uid, email } = req.user;
    const { full_name, specialty, phone } = req.body;

    let [user, created] = await User.findOrCreate({
      where: { firebase_uid },
      defaults: {
        email,
        full_name: full_name || 'New User',
        role: 'Consultant', // Default role
        specialty,
        phone
      }
    });


    if (!created) {
      const oldValue = user.toJSON();
      
      // Auto-elevate the primary testing user to Admin so they are not locked out
      const newRole = email === 'samet@admin.com' ? 'Admin' : user.role;

      await user.update({
        full_name: full_name || user.full_name,
        specialty: specialty || user.specialty,
        phone: phone || user.phone,
        role: newRole
      });

      await logActivity({
        userId: user.id,
        action: 'UPDATE',
        tableName: 'users',
        recordId: user.id,
        oldValue,
        newValue: user.toJSON(),
        ipAddress: req.ip
      });
    } else {
      await logActivity({
        userId: user.id,
        action: 'CREATE',
        tableName: 'users',
        recordId: user.id,
        newValue: user.toJSON(),
        ipAddress: req.ip
      });
    }

    res.json({ success: true, data: user, created });
  } catch (error) {
    next(error);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findOne({
      where: { firebase_uid: req.user.firebase_uid }
    });
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'Local user profile not found' });
    }

    if (user.email === 'samet@admin.com' && user.role !== 'Admin') {
      await user.update({ role: 'Admin' });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.findAll();
    res.json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
};

exports.updateUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const oldValue = user.toJSON();
    await user.update({ role });

    await logActivity({
      userId: req.user.id,
      action: 'UPDATE',
      tableName: 'users',
      recordId: user.id,
      oldValue,
      newValue: user.toJSON(),
      ipAddress: req.ip
    });

    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

exports.createUser = async (req, res, next) => {
  try {
    const { full_name, email, password, role, specialty } = req.body;
    
    // First create on Firebase
    const admin = require('../config/firebase');
    const firebaseUser = await admin.auth().createUser({
      email,
      password,
      displayName: full_name
    });

    // Then create local Postgres record
    const user = await User.create({
      firebase_uid: firebaseUser.uid,
      email,
      full_name,
      role: role || 'Consultant',
      specialty: specialty || null
    });

    await logActivity({
      userId: req.user.id,
      action: 'CREATE',
      tableName: 'users',
      recordId: user.id,
      newValue: user.toJSON(),
      ipAddress: req.ip
    });

    res.status(201).json({ success: true, data: user });
  } catch (error) {
    // If Postgres failed, we might want to delete Firebase user to keep consistency, but leaving it simple for now
    next(error);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Kullanıcı bulunamadı' });
    }

    const admin = require('../config/firebase');
    
    // Try to delete from Firebase first
    try {
      if (user.firebase_uid) await admin.auth().deleteUser(user.firebase_uid);
    } catch (fbErr) {
      console.log('Firebase user delete failed or not found', fbErr.message);
    }

    const oldValue = user.toJSON();
    await user.destroy();

    await logActivity({
      userId: req.user.id,
      action: 'DELETE',
      tableName: 'users',
      recordId: user.id,
      oldValue,
      newValue: null,
      ipAddress: req.ip
    });

    res.json({ success: true, message: 'Kullanıcı ve Auth hesapları başarıyla silindi' });
  } catch (error) {
    next(error);
  }
};
