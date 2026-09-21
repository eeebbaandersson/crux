const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// User Routes
// /api/users/:id

router.get('/:id', userController.getUserById);
router.put('/:id', userController.updateUserProfile);
router.delete('/:id', userController.deleteUser);

module.exports = router;

