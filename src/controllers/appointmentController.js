const { Appointment, Room, User, Client, Service, ClientPackage } = require('../models');
const { logActivity } = require('../utils/auditLogger');
const { Op } = require('sequelize');

/**
 * Randevu Çakışma Kontrolü (Hatasız Mantık)
 * Bir oda veya uzman, aynı anda iki yerde olamaz.
 */
const checkCollision = async ({ room_id, consultant_id, start_time, end_time, exclude_id = null }) => {
  // Veritabanındaki UTC farklarını önlemek için tarihleri netleştiriyoruz
  const start = new Date(start_time);
  const end = new Date(end_time);

  const whereClause = {
    [Op.and]: [
      { start_time: { [Op.lt]: end } },
      { end_time: { [Op.gt]: start } },
      {
        [Op.or]: [
          { room_id: room_id },
          { consultant_id: consultant_id }
        ]
      }
    ]
  };

  if (exclude_id) {
    whereClause[Op.and].push({ id: { [Op.ne]: exclude_id } });
  }

  const collision = await Appointment.findOne({ where: whereClause });
  return !!collision;
};

exports.getAppointments = async (req, res, next) => {
  try {
    const appointments = await Appointment.findAll({
      include: [
        { model: Client, as: 'client', attributes: ['id', 'full_name', 'birth_date'] },
        { model: User, as: 'consultant', attributes: ['id', 'full_name'] },
        { model: Room, as: 'room', attributes: ['id', 'name'] }
      ],
      order: [['start_time', 'ASC']]
    });
    res.json({ success: true, data: appointments });
  } catch (error) {
    next(error);
  }
};

exports.createAppointment = async (req, res, next) => {
  let { room_id, consultant_id, client_id, service_id, start_time, end_time, notes } = req.body;

  try {
    // 1. Eğer service_id gönderilmemişse, veritabanındaki ilk aktif hizmeti al
    if (!service_id) {
      const defaultService = await Service.findOne({ where: { is_active: true } });
      service_id = defaultService ? defaultService.id : null;
    }

    // 2. Çakışma Kontrolü (Daha esnek kontrol)
    const hasCollision = await checkCollision({
      room_id,
      consultant_id,
      start_time,
      end_time
    });

    if (hasCollision) {
      return res.status(409).json({ 
        success: false, 
        message: 'DİKKAT: Seçilen saatte oda veya uzman dolu görünüyor. Lütfen saat dilimini kontrol edin.' 
      });
    }

    // 3. Randevuyu Oluştur
    const appointment = await Appointment.create({
      room_id,
      consultant_id,
      client_id,
      service_id,
      start_time,
      end_time,
      notes,
      status: 'Planned'
    });

    res.status(201).json({ success: true, data: appointment });
  } catch (error) {
    console.error('Randevu Hatası:', error);
    res.status(500).json({ success: false, message: 'İşlem sırasında sunucu hatası oluştu.' });
  }
};

exports.updateAppointmentStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const appointment = await Appointment.findByPk(req.params.id);
    if (!appointment) return res.status(404).json({ success: false, message: 'Randevu bulunamadı' });
    
    // ZİNCİRLEME MANTIK: Katıldı (Completed) ise ve önceden Completed değilse paketten düş.
    if (status === 'Completed' && appointment.status !== 'Completed') {
      const pkg = await ClientPackage.findOne({
        where: { 
          client_id: appointment.client_id, 
          service_id: appointment.service_id,
          status: 'Active'
        }
      });
      if (pkg) {
        pkg.used_sessions += 1;
        if (pkg.used_sessions >= pkg.total_sessions) {
          pkg.status = 'Completed'; // Paket Bitti
        }
        await pkg.save();
      }
    }

    // Katılmadı (NoShow) olursa seans düşülmüyor (Kullanıcı talebi).
    
    await appointment.update({ status });
    res.json({ success: true, data: appointment });
  } catch (error) {
    next(error);
  }
};
