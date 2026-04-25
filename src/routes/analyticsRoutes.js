const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { verifyToken, checkRole } = require('../middleware/auth');

router.use(verifyToken);

// Stats are generally for Admin and FrontDesk
router.get('/dashboard', checkRole(['Admin', 'FrontDesk']), analyticsController.getDashboardStats);
router.get('/advanced', checkRole(['Admin', 'Manager']), analyticsController.getAdvancedAnalytics);
router.get('/report', checkRole(['Admin', 'FrontDesk']), analyticsController.exportDailyReport);

module.exports = router;
