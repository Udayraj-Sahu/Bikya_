const express = require('express');
const documentController = require('../controllers/document.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

// Protect all routes
router.use(authMiddleware.protect);
router.use(authMiddleware.restrictTo('owner'));

// Routes
router.get('/', documentController.getAllDocuments);
router.get('/:id', documentController.getDocumentById);
router.put('/:id', documentController.updateDocumentStatus);

module.exports = router;