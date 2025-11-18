const router = require('express').Router();
const { requireAuth } = require('../middlewares/auth.middleware');
const ctrl = require('../controllers/feedback.controller');

// Requerir autenticación para crear feedback (permite tracking del usuario)
router.post('/', requireAuth, ctrl.createFeedback);

module.exports = router;

