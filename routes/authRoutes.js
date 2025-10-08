const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const emailVerificationController = require('../controllers/emailVerificationController');

// User registration route
router.post('/register', authController.register);

// User login route
router.post('/login', authController.login);

// Email verification route
router.post('/verify-email', emailVerificationController.verifyEmail);

// Check email verification status
router.get('/verify-email/:email', emailVerificationController.checkEmailVerification);

module.exports = router;
