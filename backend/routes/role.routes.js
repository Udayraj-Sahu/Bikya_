const express = require('express');
const roleController = require('../controllers/role.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

// Protect all routes (Owner only)
router.use(authMiddleware.protect);
router.use(authMiddleware.restrictTo('owner'));

// Routes
router.put('/:userId', roleController.assignRole);
router.get('/users', roleController.getAllUsers);

module.exports = router;