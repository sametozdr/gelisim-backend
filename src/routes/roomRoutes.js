const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');
const { verifyToken, checkRole } = require('../middleware/auth');

// All routes require authenticated user
router.use(verifyToken);

router.get('/', roomController.getRooms);
router.get('/:id', roomController.getRoomById);

// Management routes restricted to Admin and FrontDesk
router.post('/', checkRole(['Admin', 'FrontDesk']), roomController.createRoom);
router.put('/:id', checkRole(['Admin', 'FrontDesk']), roomController.updateRoom);
router.delete('/:id', checkRole(['Admin', 'FrontDesk']), roomController.deleteRoom);

module.exports = router;
