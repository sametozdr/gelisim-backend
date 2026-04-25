const express = require('express');
const router = express.Router();
const evaluationController = require('../controllers/evaluationController');
const { verifyToken, checkRole } = require('../middleware/auth');

router.use(verifyToken);

// Consultants can create evaluations (close sessions)
router.post('/', checkRole(['Admin', 'Consultant']), evaluationController.createEvaluation);

// View specific evaluation
router.get('/appointment/:appointmentId', evaluationController.getEvaluationByAppointment);

module.exports = router;
