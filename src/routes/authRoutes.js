// src/routes/authRoutes.js
const express = require('express');
const authController = require('../controllers/authController');
const { registerValidationRules, loginValidationRules, validate } = require('../validators/authValidator');

const router = express.Router();

// Terapkan aturan validasi SEBELUM controller dijalankan
router.post(
    '/register',
    registerValidationRules(),
    validate,
    authController.register
);

router.post(
    '/login',
    loginValidationRules(),
    validate,
    authController.login
);

module.exports = router;