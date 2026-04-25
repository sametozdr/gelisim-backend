const { Appointment, Room, User, Client, sequelize } = require('../models');
const { Op } = require('sequelize');

exports.getDashboardStats = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const [totalSessionsToday, totalClients, totalRooms, recentAppointments] = await Promise.all([
      Appointment.count({
        where: {
          start_time: { [Op.between]: [today, tomorrow] }
        }
      }),
      Client.count(),
      Room.count({ where: { status: 'Active' } }),
      Appointment.findAll({
        limit: 5,
        order: [['start_time', 'DESC']],
        include: [
          { model: Client, as: 'client', attributes: ['full_name'] },
          { model: User, as: 'consultant', attributes: ['full_name'] }
        ]
      })
    ]);

    // Oda Doluluk Analizi
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const roomUsage = await Appointment.findAll({
      where: {
        start_time: { [Op.gte]: sevenDaysAgo },
        status: 'Completed'
      },
      attributes: [
        'room_id',
        [sequelize.fn('SUM', sequelize.literal("EXTRACT(EPOCH FROM (end_time - start_time))/3600")), 'total_hours']
      ],
      group: ['Appointment.room_id', 'room.id', 'room.name'],
      include: [{ model: Room, as: 'room', attributes: ['name'] }]
    });

    res.json({
      success: true,
      data: {
        todaySessions: totalSessionsToday || 0,
        activeClients: totalClients || 0,
        activeRooms: totalRooms || 0,
        recentAppointments: recentAppointments || [],
        roomUsage: roomUsage.map(u => ({
          name: u.room?.name || 'Bilinmeyen Oda',
          hours: parseFloat(u.get('total_hours') || 0).toFixed(1)
        }))
      }
    });
  } catch (error) {
    console.error('Analytics Error:', error);
    res.status(200).json({ // Hata olsa bile 200 dönüp boş veri veriyoruz ki UI çökmesin
      success: false,
      data: {
        todaySessions: 0,
        activeClients: 0,
        activeRooms: 0,
        recentAppointments: [],
        roomUsage: []
      }
    });
  }
};

const pdfService = require('../services/pdfService');

exports.exportDailyReport = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const appointments = await Appointment.findAll({
      where: {
        start_time: { [Op.between]: [today, tomorrow] }
      },
      include: [
        { model: Client, as: 'client', attributes: ['full_name'] },
        { model: User, as: 'consultant', attributes: ['full_name'] },
        { model: Room, as: 'room', attributes: ['name'] }
      ],
      order: [['start_time', 'ASC']]
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Rapor.pdf`);

    pdfService.generateDailyReport({
      date: today.toLocaleDateString('tr-TR'),
      appointments: appointments || []
    }, res);

  } catch (error) {
    next(error);
  }
};

exports.getAdvancedAnalytics = async (req, res, next) => {
  try {
    const { startDate, endDate, clientId } = req.query;
    const start = startDate ? new Date(startDate) : new Date(new Date().setMonth(new Date().getMonth() - 1));
    const end = endDate ? new Date(endDate) : new Date();
    end.setHours(23, 59, 59, 999);

    const apptWhere = {
      start_time: { [Op.between]: [start, end] },
      status: { [Op.in]: ['Completed', 'NoShow'] }
    };
    if (clientId && clientId !== '') apptWhere.client_id = clientId;

    // 1. Katılım Analizi (Attendance Breakdown)
    const appointments = await Appointment.findAll({ where: apptWhere });

    let totalCompleted = 0;
    let totalNoShow = 0;

    appointments.forEach(app => {
      if (app.status === 'Completed') totalCompleted++;
      if (app.status === 'NoShow') totalNoShow++;
    });

    const totalAttendance = totalCompleted + totalNoShow;
    const noShowRate = totalAttendance > 0 ? ((totalNoShow / totalAttendance) * 100).toFixed(1) : 0;

    // 2. Finans ve Ödeme Oranı (Financial Flow)
    const { ClientPackage } = require('../models');
    
    const pkgWhere = {
      created_at: { [Op.between]: [start, end] }
    };
    if (clientId && clientId !== '') pkgWhere.client_id = clientId;

    const packages = await ClientPackage.findAll({ where: pkgWhere });

    let expectedRevenue = 0;
    let collectedRevenue = 0;
    let remainingDebt = 0;

    packages.forEach(pkg => {
      expectedRevenue += parseFloat(pkg.total_price || 0);
      remainingDebt += parseFloat(pkg.balance_due || 0);
      collectedRevenue += (parseFloat(pkg.total_price || 0) - parseFloat(pkg.balance_due || 0));
    });

    const collectionRate = expectedRevenue > 0 ? ((collectedRevenue / expectedRevenue) * 100).toFixed(1) : 0;

    res.json({
      success: true,
      data: {
        dateRange: { start, end },
        attendance: {
          totalCompleted,
          totalNoShow,
          totalValidAppointments: totalAttendance,
          noShowRate: `${noShowRate}%`
        },
        finances: {
          expectedRevenue,
          collectedRevenue,
          remainingDebt,
          collectionRate: `${collectionRate}%`
        }
      }
    });

  } catch (error) {
    console.error('Advanced Analytics Error:', error);
    next(error);
  }
};
