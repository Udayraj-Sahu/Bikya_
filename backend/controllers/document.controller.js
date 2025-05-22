const Document = require('../models/document.model');
const User = require('../models/user.model');
const AppError = require('../utils/appError');
const { uploadWithRetry } = require('../config/cloudinary');

// @desc    Get all documents
// @route   GET /api/documents
// @access  Private (Owner only)
exports.getAllDocuments = async (req, res, next) => {
  try {
    const { status = 'pending' } = req.query;

    // Validate status
    if (!['pending', 'approved', 'rejected', 'all'].includes(status)) {
      return next(new AppError('Invalid status.', 400));
    }

    // Build filter
    const filter = {};
    if (status !== 'all') {
      filter.status = status;
    }

    const documents = await Document.find(filter)
      .populate({
        path: 'userId',
        select: 'fullName email phone',
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: documents.length,
      data: {
        documents,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get document by ID
// @route   GET /api/documents/:id
// @access  Private (Owner only)
exports.getDocumentById = async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id).populate({
      path: 'userId',
      select: 'fullName email phone',
    });

    if (!document) {
      return next(new AppError('Document not found.', 404));
    }

    res.status(200).json({
      success: true,
      data: {
        document,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update document status
// @route   PUT /api/documents/:id
// @access  Private (Owner only)
exports.updateDocumentStatus = async (req, res, next) => {
  try {
    const { status, rejectionReason } = req.body;

    // Validate status
    if (!status || !['approved', 'rejected'].includes(status)) {
      return next(
        new AppError('Please provide a valid status (approved or rejected).', 400)
      );
    }

    // If status is rejected, require rejection reason
    if (status === 'rejected' && !rejectionReason) {
      return next(
        new AppError('Please provide a reason for rejection.', 400)
      );
    }

    const document = await Document.findById(req.params.id);
    if (!document) {
      return next(new AppError('Document not found.', 404));
    }

    // Update document
    document.status = status;
    document.rejectionReason = status === 'rejected' ? rejectionReason : null;
    document.reviewedBy = req.user.id;
    document.reviewedAt = Date.now();

    await document.save();

    res.status(200).json({
      success: true,
      data: {
        document,
      },
    });
  } catch (error) {
    next(error);
  }
};