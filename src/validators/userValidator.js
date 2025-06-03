// src/validators/userValidator.js
const { body, validationResult } = require('express-validator');

// Aturan validasi untuk membuat pengguna (oleh admin)
exports.createUserValidationRules = () => {
    return [
        body('username')
            .notEmpty().withMessage('Username tidak boleh kosong.')
            .isLength({ min: 3 }).withMessage('Username minimal harus 3 karakter.'),
        
        body('password')
            .notEmpty().withMessage('Password tidak boleh kosong.')
            .isLength({ min: 6 }).withMessage('Password minimal harus 6 karakter.'),
            
        body('role')
            .notEmpty().withMessage('Role tidak boleh kosong.')
            .isIn(['ADMIN', 'KASIR']).withMessage('Role tidak valid. Pilih ADMIN atau KASIR.'),
    ];
};

// Aturan validasi untuk update pengguna
exports.updateUserValidationRules = () => {
    return [
        body('username')
            .optional()
            .isLength({ min: 3 }).withMessage('Username minimal harus 3 karakter.'),
        
        body('password')
            .optional()
            .isLength({ min: 6 }).withMessage('Password minimal harus 6 karakter.'),
            
        body('role')
            .optional()
            .isIn(['ADMIN', 'KASIR']).withMessage('Role tidak valid. Pilih ADMIN atau KASIR.'),
    ];
};


// Middleware validate (copy dari file lain)
exports.validate = (req, res, next) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
        return next();
    }
    const extractedErrors = [];
    errors.array().map(err => extractedErrors.push({ [err.path]: err.msg }));
    return res.status(422).json({
        status: 'fail',
        message: 'Data yang diberikan tidak valid.',
        errors: extractedErrors,
    });
};