// backend/middleware/upload.middleware.js
const multer = require('multer');
const AppError = require('../utils/appError');

// Configure multer for memory storage
const multerStorage = multer.memoryStorage();

// Filter to allow only specific image types
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB file size limit
});

// Middleware to handle multiple fields (e.g., 'frontImage', 'backImage')
// Adjust field names based on what your frontend will send
exports.uploadUserDocumentImages = upload.fields([
  { name: 'frontImage', maxCount: 1 },
  { name: 'backImage', maxCount: 1 }
]);

// If you are uploading a single file (e.g. a PDF or a single image for a document type)
// exports.uploadSingleUserDocument = upload.single('documentFile');
