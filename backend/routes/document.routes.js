// backend/routes/document.routes.js
const express = require('express');
const documentController = require('../controllers/document.controller');
const authMiddleware = require('../middleware/auth.middleware');
const uploadMiddleware = require('../middleware/upload.middleware'); // Your multer middleware
const { body, param } = require('express-validator');
const validationMiddleware = require('../middleware/validation.middleware');

const router = express.Router();

// All routes below are protected
router.use(authMiddleware.protect);

// User uploads their documents
router.post(
  '/',
  uploadMiddleware.uploadUserDocumentImages, // Handles 'frontImage' and 'backImage' fields
  [
    body('documentType')
      .isIn(['idCard', 'drivingLicense'])
      .withMessage('Invalid document type. Must be "idCard" or "drivingLicense".')
  ],
  validationMiddleware.handleValidationErrors,
  documentController.uploadDocument
);

// User gets their own submitted documents
router.get('/me', documentController.getUserDocuments);

// Owner gets all pending documents for review
router.get(
  '/pending',
  authMiddleware.restrictTo('owner'),
  documentController.getPendingDocuments
);

// Owner updates the status of a document
router.patch(
  '/:id/status',
  authMiddleware.restrictTo('owner'),
  [
    param('id').isMongoId().withMessage('Invalid document ID format.'),
    body('status')
      .isIn(['approved', 'rejected'])
      .withMessage('Status must be "approved" or "rejected".')
  ],
  validationMiddleware.handleValidationErrors,
  documentController.updateDocumentStatus
);

module.exports = router;
