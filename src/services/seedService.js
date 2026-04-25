const { Room, Service } = require('../models');

const seedData = async () => {
  try {
    // 1. Seed Rooms
    const roomsCount = await Room.count();
    if (roomsCount === 0) {
      const rooms = [
        { name: 'Güneş Odası (Oda 1)', capacity: 2 },
        { name: 'Mavi Oda (Oda 2)', capacity: 4 },
        { name: 'Terapi Odası 3', capacity: 2 },
        { name: 'Grup Eğitim Odası 4', capacity: 10 },
        { name: 'Pedagoji Odası 5', capacity: 3 }
      ];
      await Room.bulkCreate(rooms);
      console.log('Default rooms seeded');
    }

    // 2. Seed Services
    const servicesCount = await Service.count();
    if (servicesCount === 0) {
      const services = [
        { name: 'Bireysel Psikolojik Danışmanlık', default_price: 1500, duration_min: 50 },
        { name: 'Çocuk ve Ergen Terapisi', default_price: 1200, duration_min: 45 },
        { name: 'Eğitim Koçluğu (LGS/YKS)', default_price: 1000, duration_min: 60 },
        { name: 'WISC-R Zeka Testi', default_price: 3500, duration_min: 120 },
        { name: 'Aile Danışmanlığı', default_price: 2000, duration_min: 90 }
      ];
      await Service.bulkCreate(services);
      console.log('Default services seeded');
    }
  } catch (error) {
    console.error('Seeding error:', error.message);
  }
};

module.exports = seedData;
