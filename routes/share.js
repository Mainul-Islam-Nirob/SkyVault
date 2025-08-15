const express = require('express');
const router = express.Router();
const { generateShareLink, viewSharedFolder, showShareForm } = require('../controllers/shareController');

// Show share form page
router.get('/folders/:id/share', showShareForm);

// Generate shareable link
router.post('/folders/:id/share', generateShareLink);

// Public view of shared folder
router.get('/share/:uuid', viewSharedFolder);

module.exports = router;