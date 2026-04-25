const express = require('express');
const router = express.Router();
const packageController = require('../controllers/packageController');
const { verifyToken, checkRole } = require('../middleware/auth');

router.use(verifyToken);

// Management restricted to Admin/FrontDesk
router.post('/', checkRole(['Admin', 'FrontDesk']), packageController.createPackage);
router.get('/', packageController.getAllPackages);
router.get('/client/:clientId', packageController.getClientPackages);
router.patch('/:id/payment', checkRole(['Admin', 'FrontDesk']), packageController.updatePayment);
router.patch('/:id/extend', checkRole(['Admin', 'FrontDesk']), packageController.extendPackage);
router.delete('/:id', checkRole(['Admin', 'Manager']), packageController.deletePackage);

module.exports = router;
