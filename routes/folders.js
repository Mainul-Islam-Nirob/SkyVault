const express = require('express');
const router = express.Router();
const folderController = require('../controllers/folderController');
const isAuth = require('../middleware/isAuth');
const upload = require('../middleware/multer');

// Upload routes 
router.get('/upload', isAuth, folderController.showRootUploadForm);
router.post('/upload', isAuth, upload.single('file'), folderController.uploadFile);

// Folder-specific upload
router.get('/:id/upload', isAuth, folderController.showFolderUploadForm);
router.post('/:id/upload', isAuth, upload.single('file'), folderController.uploadToFolder);

// Folder CRUD routes
router.get('/new', isAuth, folderController.showCreateForm);
router.post('/', isAuth, folderController.createFolder);
router.get('/:id/edit', isAuth, folderController.showEditForm);
router.post('/:id', isAuth, folderController.updateFolder);
router.post('/:id/delete', isAuth, folderController.deleteFolder);

// Nested folder
router.get('/:id/new-folder', isAuth, folderController.showNestedForm);
router.post('/:id/new-folder', isAuth, folderController.createNestedFolder);

// View folder 
router.get('/:id', isAuth, folderController.viewFolder);

// List all folders for user
router.get('/', isAuth, folderController.listFolders);

module.exports = router;
