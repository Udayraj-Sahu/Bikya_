const express = require('express');
const bikeController = require('../controllers/bike.controller');
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
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file format'), false);
    }
  },
});

// Public routes
router.get('/', bikeController.getAllBikes);
router.get('/:id', bikeController.getBikeById);

// Protected routes (Admin only)
router.use(authMiddleware.protect);
router.use(authMiddleware.restrictTo('admin', 'owner'));

router.post('/', upload.array('images', 5), bikeController.createBike);
router.put('/:id', bikeController.updateBike);
router.delete('/:id', bikeController.deleteBike);

module.exports = router;