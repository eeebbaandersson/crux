const express = require('express');
const router = express.Router({ mergeParams: true });
const problemController = require('../controllers/problemController');

// Problem Routes
// /api/problems --> Anges i server.js filen

router.get('/',problemController.getProblems);
router.get('/:id', problemController.getProblemById);
router.post('/', problemController.createProblem);
router.put('/:id', problemController.updateProblem);
router.delete('/:id', problemController.deleteProblem);

module.exports = router;

