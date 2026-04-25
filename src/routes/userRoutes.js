const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken, checkRole } = require('../middleware/auth');

router.use(verifyToken);

router.get('/me', userController.getMe);
router.post('/sync', userController.syncProfile);

// Admin only routes
router.get('/', checkRole(['Admin', 'Manager']), userController.getAllUsers);
router.post('/', checkRole(['Admin', 'Manager']), userController.createUser);
router.put('/:id/role', checkRole(['Admin', 'Manager']), userController.updateUserRole);
router.delete('/:id', checkRole(['Admin', 'Manager']), userController.deleteUser);

module.exports = router;
