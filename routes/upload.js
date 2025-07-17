const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const isAuth = require('../middleware/isAuth');


// Upload file to root
router.get('/upload', isAuth, uploadController.showUploadForm);
router.post('/upload', isAuth, upload.single('file'), uploadController.uploadFile);

// Upload file to specific folder
router.get('/:id/upload', isAuth, uploadController.showUploadForm);
router.post('/:id/upload', isAuth, upload.single('file'), uploadController.uploadToFolder);

