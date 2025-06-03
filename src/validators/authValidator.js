// src/validators/authValidator.js
const { body, validationResult } = require('express-validator');

// Aturan validasi untuk registrasi
exports.registerValidationRules = () => {
    return [
        // username tidak boleh kosong
        body('username')
            .notEmpty().withMessage('Username tidak boleh kosong.')
            .isLength({ min: 3 }).withMessage('Username minimal harus 3 karakter.'),
        
        // password minimal 6 karakter
        body('password')
            .isLength({ min: 6 }).withMessage('Password minimal harus 6 karakter.'),
            
        // role (jika ada) harus salah satu dari 'ADMIN' atau 'KASIR'
        body('role')
            .optional() // Role bersifat opsional saat register
            .isIn(['ADMIN', 'KASIR']).withMessage('Role tidak valid. Pilih ADMIN atau KASIR.'),
    ];
};

// Aturan validasi untuk login
exports.loginValidationRules = () => {
    return [
        body('username').notEmpty().withMessage('Username tidak boleh kosong.'),
        body('password').notEmpty().withMessage('Password tidak boleh kosong.'),
    ];
};


// Middleware untuk mengecek hasil validasi
exports.validate = (req, res, next) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
        return next(); // Jika tidak ada error, lanjutkan ke controller
    }

    // Jika ada error, kumpulkan pesan errornya
    const extractedErrors = [];
    errors.array().map(err => extractedErrors.push({ [err.path]: err.msg }));

    return res.status(422).json({
        status: 'fail',
        message: 'Data yang diberikan tidak valid.',
        errors: extractedErrors,
    });
};