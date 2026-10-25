const express = require('express');
const router = express.Router({ mergeParams: true });
const problemController = require('../controllers/problemController');
const { uploadSingle, processImage } = require('../middleware/upload');

// Problem Routes
// /api/problems --> Anges i server.js filen

router.get('/',problemController.getProblems);
router.post('/', problemController.createProblem);

// Handle image upload, middleware runs first followed by controller
router.post('/:id/image', uploadSingle, processImage, problemController.uploadProblemImage);

router.get('/:id', problemController.getProblemById);
router.put('/:id', problemController.updateProblem);
router.delete('/:id', problemController.deleteProblem);

module.exports = router;

