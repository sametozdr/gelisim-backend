const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');
const { verifyToken, checkRole } = require('../middleware/auth');

router.use(verifyToken);

router.get('/', clientController.getClients);
router.get('/:id', clientController.getClientById);

// All roles can create/update clients, but only specific ones can do specialized tasks
router.post('/', clientController.createClient);
router.put('/:id', clientController.updateClient);
router.delete('/:id', checkRole(['Admin', 'FrontDesk', 'Manager']), clientController.deleteClient);

// Documents
router.post('/documents', clientController.addDocument);

module.exports = router;
