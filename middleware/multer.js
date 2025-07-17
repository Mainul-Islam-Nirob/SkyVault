const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Use 'root' folder if no id is provided
    const folderId = req.params.id || 'root';
    const uploadPath = path.join(__dirname, '..', 'uploads', folderId);

    // Ensure the directory exists
    fs.mkdirSync(uploadPath, { recursive: true });

    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  cb(null, true); 
};

const upload = multer({ storage, fileFilter });

module.exports = upload;
