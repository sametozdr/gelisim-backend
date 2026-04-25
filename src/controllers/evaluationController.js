const { Evaluation, Appointment, ClientPackage, sequelize } = require('../models');
const { logActivity } = require('../utils/auditLogger');

exports.createEvaluation = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { appointment_id, scores, notes, next_target, confidentiality_level } = req.body;

    // 1. Randevuyu bul
    const appointment = await Appointment.findByPk(appointment_id);
    if (!appointment) {
      await t.rollback();
      return res.status(404).json({ success: false, message: 'Randevu bulunamadı' });
    }

    // 2. Halihazırda değerlendirme yapılmış mı?
    const existingEval = await Evaluation.findOne({ where: { appointment_id } });
    if (existingEval) {
      await t.rollback();
      return res.status(400).json({ success: false, message: 'Bu seans için zaten değerlendirme yapılmış' });
    }

    // 3. Değerlendirmeyi kaydet
    const evaluation = await Evaluation.create({
      appointment_id,
      client_id: appointment.client_id,
      consultant_id: req.user.id,
      scores,
      notes,
      next_target,
      confidentiality_level: confidentiality_level || 'Normal'
    }, { transaction: t });

    // 4. Randevu durumunu 'Completed' yap
    const oldAppointment = appointment.toJSON();
    await appointment.update({ status: 'Completed' }, { transaction: t });

    // 5. [KRİTİK]: Eğer bir pakete bağlıysa kullanılmış seansı artır
    if (appointment.package_id) {
      const pkg = await ClientPackage.findByPk(appointment.package_id);
      if (pkg) {
        await pkg.increment('used_sessions', { by: 1, transaction: t });
      }
    }

    await t.commit();

    // Audit Log (İşlem başarılı olduktan sonra)
    await logActivity({
      userId: req.user.id,
      action: 'CREATE',
      tableName: 'evaluations',
      recordId: evaluation.id,
      newValue: evaluation.toJSON(),
      ipAddress: req.ip
    });

    res.status(201).json({ success: true, data: evaluation });
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

exports.getEvaluationByAppointment = async (req, res, next) => {
  try {
    const evaluation = await Evaluation.findOne({
      where: { appointment_id: req.params.appointmentId }
    });
    res.json({ success: true, data: evaluation });
  } catch (error) {
    next(error);
  }
};
