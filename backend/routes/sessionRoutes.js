const express = require('express');
const router = express.Router({ mergeParams: true });
const sessionController = require('../controllers/sessionController');

// Session Routes

router.get('/', sessionController.getSessions);
router.get('/active', sessionController.getActiveSession);
router.post('/', sessionController.createSession);
router.patch('/:sessionId/end', sessionController.endSession);
router.delete('/:sessionId', sessionController.deleteSession);

module.exports = router;

