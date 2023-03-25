const multer = require('multer');
const mime = require('mime');
const express = require("express");
const app = express();
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'public/product-images');
  },
  filename: function(req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileExtension = mime.getExtension(file.mimetype);
    cb(null, file.fieldname + '-' + uniqueSuffix + '.' + fileExtension);
  }
});

const fileFilter = function(req, file, cb) {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];
  const maxFileSize = 5 * 1024 * 1024; // 5 MB

  if (file.mimetype === 'application/pdf') {
    const error = new Error('PDF files are not allowed');
    error.status = 404;
    return cb(error);
  } else if (allowedMimeTypes.includes(file.mimetype) || file.size <= maxFileSize) {
    cb(null, true);
  } else {
    const error = new Error('Only JPEG, PNG, and GIF images are allowed and maximum file size is 5 MB');
    error.status = 404;
    return cb(error);
  }
}

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter
});

const multiUpload = upload.fields([{ name: 'image', maxCount: 1 }, { name: 'sideimage', maxCount: 8 }]);


module.exports = multiUpload;
