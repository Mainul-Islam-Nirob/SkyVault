const express = require('express');
const router = express.Router();
const fileController = require('../controllers/fileController');
const isAuth = require('../middleware/isAuth');


router.get('/:id/download', isAuth, fileController.downloadFile);

router.post('/:id/delete', isAuth, fileController.deleteFile);

module.exports = router;