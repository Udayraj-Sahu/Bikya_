// backend/routes/bike.routes.js
const express = require('express');
const bikeController = require('../controllers/bike.controller');
const authMiddleware = require('../middleware/auth.middleware');
const validationMiddleware = require('../middleware/validation.middleware');
const { body, param, query } = require('express-validator'); // Import query for getAllBikes

const router = express.Router();

// --- Public/User Routes ---
router.get('/',
  [ // Optional validation for query params
    query('category').optional().isString().trim(),
    query('model').optional().isString().trim(),
    query('coords').optional().isString().matches(/^(\-?\d+(\.\d+)?),(\-?\d+(\.\d+)?)$/)
      .withMessage('Coordinates must be in "longitude,latitude" format.'),
    query('maxDistance').optional().isInt({ min: 1 }).toInt(),
  ],
  validationMiddleware.handleValidationErrors,
  bikeController.getAllBikes
);

router.get('/:id',
  [
    param('id').isMongoId().withMessage('Invalid bike ID format')
  ],
  validationMiddleware.handleValidationErrors,
  bikeController.getBikeById
);


// --- Admin/Owner Restricted Routes ---
router.post(
  '/',
  authMiddleware.protect,
  authMiddleware.restrictTo('admin', 'owner'), // Or just 'admin'
  [ // Input validation for creating a bike
    body('model').notEmpty().withMessage('Model is required').trim(),
    body('category').notEmpty().withMessage('Category is required').trim(),
    body('pricePerHour').isFloat({ gt: 0 }).withMessage('Price per hour must be a positive number'),
    body('pricePerDay').isFloat({ gt: 0 }).withMessage('Price per day must be a positive number'),
    body('location').notEmpty().withMessage('Location object is required'),
    body('location.coordinates').isArray({ min: 2, max: 2 }).withMessage('Location coordinates must be an array of [longitude, latitude]'),
    body('location.coordinates.*').isNumeric().withMessage('Coordinates must be numbers'),
    body('addressText').optional().isString().trim(),
    body('images').isArray({ min: 1 }).withMessage('At least one image URL is required'),
    body('images.*').isURL().withMessage('Each image must be a valid URL'),
    body('availability').optional().isBoolean().withMessage('Availability must be true or false'),
  ],
  validationMiddleware.handleValidationErrors,
  bikeController.createBike
);

router.patch( // Using PATCH for partial updates
  '/:id',
  authMiddleware.protect,
  authMiddleware.restrictTo('admin', 'owner'), // Or just 'admin'
  [
    param('id').isMongoId().withMessage('Invalid bike ID format'),
    // Optional validations for updatable fields
    body('model').optional().notEmpty().withMessage('Model cannot be empty if provided').trim(),
    body('category').optional().notEmpty().withMessage('Category cannot be empty if provided').trim(),
    body('pricePerHour').optional().isFloat({ gt: 0 }).withMessage('Price per hour must be a positive number'),
    body('pricePerDay').optional().isFloat({ gt: 0 }).withMessage('Price per day must be a positive number'),
    body('location.coordinates').optional().isArray({ min: 2, max: 2 }).withMessage('Location coordinates must be an array of [longitude, latitude]'),
    body('location.coordinates.*').optional().isNumeric().withMessage('Coordinates must be numbers'),
    body('images').optional().isArray().withMessage('Images must be an array of URLs'),
    body('images.*').optional().isURL().withMessage('Each image must be a valid URL'),
    body('availability').optional().isBoolean().withMessage('Availability must be true or false'),
  ],
  validationMiddleware.handleValidationErrors,
  bikeController.updateBike
);

router.delete(
  '/:id',
  authMiddleware.protect,
  authMiddleware.restrictTo('admin', 'owner'), // Or just 'admin'
  [
    param('id').isMongoId().withMessage('Invalid bike ID format')
  ],
  validationMiddleware.handleValidationErrors,
  bikeController.deleteBike
);

module.exports = router;
