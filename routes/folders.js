const express = require('express');
const router = express.Router();
const folderController = require('../controllers/folderController');
const isAuth = require('../middleware/isAuth');
const upload = require('../middleware/multer');

// List all folders for the user (root view)
router.get('/', isAuth, folderController.listFolders);

// Create a new root-level folder
router.get('/new', isAuth, folderController.showCreateForm);
router.post('/', isAuth, folderController.createFolder);

// Edit and update a folder
router.get('/:id/edit', isAuth, folderController.showEditForm);
router.post('/:id', isAuth, folderController.updateFolder);

// Delete a folder
router.post('/:id/delete', isAuth, folderController.deleteFolder);

// Create a nested folder inside another folder
router.get('/:id/new-folder', isAuth, folderController.showNestedForm);
router.post('/:id/new-folder', isAuth, folderController.createNestedFolder);


// Upload to root (no folder)
router.get('/upload', isAuth, folderController.showRootUploadForm);
router.post('/upload', isAuth, upload.single('file'), folderController.uploadFile);

// Upload to a specific folder
router.get('/:id/upload', isAuth, folderController.showFolderUploadForm);
router.post('/:id/upload', isAuth, upload.single('file'), folderController.uploadToFolder);

// View a specific folder and its contents
router.get('/:id', isAuth, folderController.viewFolder);

module.exports = router;