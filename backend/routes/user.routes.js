const express = require('express');
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middleware/auth.middleware');
const multer = require('multer');

const router = express.Router();

// Configure multer
const upload = multer({
  storage: multer.diskStorage({}),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === 'image/jpeg' ||
      file.mimetype === 'image/png' ||
      file.mimetype === 'application/pdf'
    ) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file format'), false);
    }
  },
});

// Protect all routes
router.use(authMiddleware.protect);

// User profile routes
router.get('/profile', userController.getUserProfile);
router.put('/profile', userController.updateUserProfile);

// User bookings routes
router.get('/bookings', userController.getUserBookings);

// User documents routes
router.get('/documents', userController.getUserDocuments);
router.post(
  '/documents',
  upload.single('document'),
  userController.uploadUserDocument
);

module.exports = router;