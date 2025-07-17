const express = require('express');
const router = express.Router();
const folderController = require('../controllers/folderController');
const isAuth = require('../middleware/isAuth');

// List all folders for user
router.get('/', isAuth, folderController.listFolders);

// Show form to create new folder
router.get('/new', isAuth, folderController.showCreateForm);

// Create folder POST
router.post('/', isAuth, folderController.createFolder);

// Show form to edit folder name
router.get('/:id/edit', isAuth, folderController.showEditForm);

// Update folder name POST
router.post('/:id', isAuth, folderController.updateFolder);

// Delete folder
router.post('/:id/delete', isAuth, folderController.deleteFolder);

module.exports = router;
