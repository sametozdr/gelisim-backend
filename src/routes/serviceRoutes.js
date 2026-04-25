const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');
const { verifyToken, checkRole } = require('../middleware/auth');

router.use(verifyToken);

router.get('/', serviceController.getServices);

// Management restricted to Admin/FrontDesk
router.post('/', checkRole(['Admin', 'FrontDesk']), serviceController.createService);
router.put('/:id', checkRole(['Admin', 'FrontDesk']), serviceController.updateService);

module.exports = router;
