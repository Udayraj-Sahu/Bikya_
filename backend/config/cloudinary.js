// backend/config/cloudinary.js
const cloudinary = require('cloudinary').v2;
const DatauriParser = require('datauri/parser');
const path = require('path');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true, // Optional: ensures HTTPS URLs
});

const parser = new DatauriParser();

// Helper function to format buffer to data URI for Cloudinary upload
const bufferToDataURI = (fileFormat, buffer) => parser.format(fileFormat, buffer);

// Helper function to upload a file buffer to Cloudinary
const uploadToCloudinary = (fileBuffer, originalFilename, folder = 'bikya_documents') => {
  return new Promise((resolve, reject) => {
    const fileFormat = path.extname(originalFilename).toString();
    const dataUri = bufferToDataURI(fileFormat, fileBuffer);
    
    cloudinary.uploader.upload(dataUri.content, {
      folder: folder,
      // public_id: `user_${userId}_${documentType}_${Date.now()}`, // Optional: custom public_id
      resource_type: 'auto', // Let Cloudinary detect the resource type
    }, (error, result) => {
      if (error) {
        console.error('Cloudinary Upload Error:', error);
        return reject(error);
      }
      resolve(result);
    });
  });
};

module.exports = { cloudinary, uploadToCloudinary };
