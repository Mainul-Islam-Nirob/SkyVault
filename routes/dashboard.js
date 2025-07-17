const express = require('express');
const router = express.Router();
const folderController = require('../controllers/folderController');
const isAuth = require('../middleware/isAuth');

router.get('/dashboard', isAuth, folderController.listFolders);
module.exports = router;
