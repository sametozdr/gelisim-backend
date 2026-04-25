require('dotenv').config();
const { Appointment, Room, User, Client, sequelize } = require('./src/models');
const { Op } = require('sequelize');

async function testQuery() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    console.log('Querying...');
    const result = await Promise.all([
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
    console.log('Success!', result.map(r => Array.isArray(r) ? r.length + ' rows' : r));
    
    // Test the second query too:
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
    console.log('Room Usage Success!', roomUsage.length);
  } catch (err) {
    console.error('ERROR OCCURRED:', err);
  } finally {
    process.exit(0);
  }
}

testQuery();
