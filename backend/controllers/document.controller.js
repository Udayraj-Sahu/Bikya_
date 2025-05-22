// backend/controllers/document.controller.js
const Document = require('../models/document.model');
const User = require('../models/user.model');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { uploadToCloudinary } = require('../config/cloudinary'); // Import helper

exports.uploadDocument = catchAsync(async (req, res, next) => {
  const { documentType } = req.body; // e.g., 'idCard', 'drivingLicense'
  const userId = req.user.id;

  if (!documentType) {
    return next(new AppError('Document type is required.', 400));
  }

  if (!req.files || (!req.files.frontImage && !req.files.backImage)) {
    return next(new AppError('Please upload at least one document image.', 400));
  }

  const uploadedDocuments = [];
  let frontImageResult, backImageResult;

  // Upload front image if present
  if (req.files.frontImage && req.files.frontImage[0]) {
    const frontImageFile = req.files.frontImage[0];
    frontImageResult = await uploadToCloudinary(
      frontImageFile.buffer,
      frontImageFile.originalname,
      `bikya_documents/${userId}` // Optional: organize by user ID in Cloudinary
    );
    const newDoc = await Document.create({
      user: userId,
      documentType,
      frontImageUri: frontImageResult.secure_url, // Or result.url
      // side: 'front', // You could set this if you always expect front/back separately
      status: 'pending',
    });
    uploadedDocuments.push(newDoc);
  }

  // Upload back image if present
  if (req.files.backImage && req.files.backImage[0]) {
    const backImageFile = req.files.backImage[0];
    backImageResult = await uploadToCloudinary(
      backImageFile.buffer,
      backImageFile.originalname,
      `bikya_documents/${userId}`
    );
    // If front image was also uploaded for the same documentType, update it.
    // Otherwise, create a new document entry. This logic depends on how you want to handle front/back.
    // For simplicity, let's assume front and back are parts of the same document entry if uploaded together.
    if (frontImageResult && uploadedDocuments.length > 0) {
        // Find the document created for the front image and add the back image URI
        const existingDoc = await Document.findById(uploadedDocuments[0]._id);
        if (existingDoc) {
            existingDoc.backImageUri = backImageResult.secure_url;
            await existingDoc.save();
        }
    } else { // If only back image is uploaded, or if you treat them as separate entries
        const newDoc = await Document.create({
            user: userId,
            documentType,
            backImageUri: backImageResult.secure_url,
            // side: 'back',
            status: 'pending',
        });
        uploadedDocuments.push(newDoc);
    }
  }
  
  // If only one image (front or back) was expected for a document type, simplify the logic above.
  // The current logic allows separate uploads or updating a single document entry.

  if (uploadedDocuments.length === 0) {
    return next(new AppError('Document image upload failed.', 500));
  }

  // Update User model
  const user = await User.findById(userId);
  if (user) {
    uploadedDocuments.forEach(doc => {
      if (!user.documents.includes(doc._id)) {
        user.documents.push(doc._id);
      }
    });
    user.idProofSubmitted = true; // Mark that documents have been submitted
    user.idProofApproved = false; // Reset approval status on new submission if needed
    await user.save({ validateBeforeSave: false }); // Save user, skip validation if only pushing to array
  }

  res.status(201).json({
    status: 'success',
    message: 'Documents uploaded successfully. Awaiting approval.',
    data: {
      documents: uploadedDocuments,
    },
  });
});

exports.getUserDocuments = catchAsync(async (req, res, next) => {
  const documents = await Document.find({ user: req.user.id }).sort('-createdAt');
  res.status(200).json({
    status: 'success',
    results: documents.length,
    data: {
      documents,
    },
  });
});

// For Owner
exports.getPendingDocuments = catchAsync(async (req, res, next) => {
  const documents = await Document.find({ status: 'pending' })
    .populate({ path: 'user', select: 'fullName email phone' }) // Populate user details
    .sort('-createdAt');

  res.status(200).json({
    status: 'success',
    results: documents.length,
    data: {
      documents,
    },
  });
});

// For Owner
exports.updateDocumentStatus = catchAsync(async (req, res, next) => {
  const { status } = req.body; // Expected: 'approved' or 'rejected'
  const documentId = req.params.id;

  if (!['approved', 'rejected'].includes(status)) {
    return next(new AppError('Invalid status. Must be "approved" or "rejected".', 400));
  }

  const document = await Document.findById(documentId);
  if (!document) {
    return next(new AppError('Document not found.', 404));
  }

  // Prevent re-approving/rejecting already processed documents if needed
  // if (document.status !== 'pending') {
  //   return next(new AppError(`Document is already ${document.status}.`, 400));
  // }

  document.status = status;
  document.reviewedAt = Date.now();
  document.reviewedBy = req.user.id; // Owner's ID
  await document.save();

  // Update the User's idProofApproved status
  const user = await User.findById(document.user);
  if (user) {
    if (status === 'approved') {
      user.idProofApproved = true;
    } else if (status === 'rejected') {
      user.idProofApproved = false;
      // Optionally, you might want to set user.idProofSubmitted = false to allow re-upload
      // or handle re-submission logic differently.
    }
    await user.save({ validateBeforeSave: false });
  }

  // TODO: Send notification to the user about document status change

  res.status(200).json({
    status: 'success',
    message: `Document ${status} successfully.`,
    data: {
      document,
    },
  });
});
