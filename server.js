require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { sequelize } = require('./src/models');
const errorHandler = require('./src/middleware/errorHandler');
const seedData = require('./src/services/seedService');

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Mental Support ERP API is running' });
});

// Import Routes
const userRoutes = require('./src/routes/userRoutes');
const roomRoutes = require('./src/routes/roomRoutes');
const clientRoutes = require('./src/routes/clientRoutes');
const serviceRoutes = require('./src/routes/serviceRoutes');
const appointmentRoutes = require('./src/routes/appointmentRoutes');
const evaluationRoutes = require('./src/routes/evaluationRoutes');
const analyticsRoutes = require('./src/routes/analyticsRoutes');
const packageRoutes = require('./src/routes/packageRoutes');

app.use('/api/users', userRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/evaluations', evaluationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/packages', packageRoutes);

// Error Handling
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

// Database Sync and Start Server
const startServer = async () => {
  try {
    // Veritabanı tablolarını güncelle (Veri kaybı yaşanmaz)
    await sequelize.sync({ alter: true });
    console.log('Database sync complete');
    
    await seedData();
    await require('./src/services/adminSeedService').seedSuperAdmin();

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error.message);
    process.exit(1);
  }
};

startServer();
