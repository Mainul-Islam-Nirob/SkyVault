const express = require('express');
const router = express.Router();
const passport = require('passport');
const authController = require('../controllers/authController');

router.get('/login', authController.loginPage);
router.get('/register', authController.registerPage);

router.post('/register', authController.registerUser);

router.post('/login',
  passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/login',
  })
);

router.get('/logout', authController.logoutUser);

module.exports = router;
