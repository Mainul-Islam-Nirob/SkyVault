const express = require('express');
const router = express.Router();
const isAuth = require('../middleware/isAuth');
const dashboardController = require('../controllers/dashboardController');

router.get('/dashboard', isAuth, dashboardController.getDashboard);

module.exports = router;
