import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure upload directory exists
const uploadDir = 'uploads/delivery-receipts/';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('✅ Created upload directory:', uploadDir);
}

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename with original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    const filename = 'receipt-' + uniqueSuffix + extension;
    
    console.log('📁 Saving delivery receipt:', filename);
    cb(null, filename);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  // Check file type
  const allowedMimes = [
    'image/jpeg', 
    'image/jpg', 
    'image/png', 
    'application/pdf'
  ];
  
  console.log('🔍 Checking file type:', file.mimetype, 'Original name:', file.originalname);
  
  if (allowedMimes.includes(file.mimetype)) {
    console.log('✅ File type accepted');
    cb(null, true);
  } else {
    console.log('❌ Invalid file type:', file.mimetype);
    cb(new Error('Invalid file type. Only JPEG, JPG, PNG, and PDF files are allowed.'), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 1 // Only allow 1 file per request
  },
  fileFilter: fileFilter
});

// Error handling middleware for multer
const handleUploadErrors = (err, req, res, next) => {
  console.log('🔄 Upload error handling:', err?.message);
  
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      console.log('❌ File size limit exceeded');
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 10MB.'
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      console.log('❌ Too many files');
      return res.status(400).json({
        success: false,
        message: 'Too many files. Only one delivery receipt is allowed.'
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      console.log('❌ Unexpected file field');
      return res.status(400).json({
        success: false,
        message: 'Unexpected file field. Please use "deliveryReceipt" as the field name.'
      });
    }
  } else if (err) {
    console.log('❌ Upload error:', err.message);
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  next();
};

export {
  upload,
  handleUploadErrors
};