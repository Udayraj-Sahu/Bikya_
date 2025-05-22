const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure upload options for optimization
const uploadOptions = {
  folder: 'bikya',
  transformation: [
    { width: 1000, height: 1000, crop: 'limit' },
    { quality: 'auto:good' },
    { fetch_format: 'auto' }
  ],
  allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'],
  resource_type: 'auto'
};

// Upload with retry logic
const uploadWithRetry = async (file, options = {}, retries = 3) => {
  try {
    const result = await cloudinary.uploader.upload(
      file,
      { ...uploadOptions, ...options }
    );
    return result;
  } catch (error) {
    if (retries > 0) {
      console.log(`Retrying upload... (${retries} attempts remaining)`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      return uploadWithRetry(file, options, retries - 1);
    }
    throw error;
  }
};

module.exports = {
  cloudinary,
  uploadWithRetry,
  uploadOptions
};