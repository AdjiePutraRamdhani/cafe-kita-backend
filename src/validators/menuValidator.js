// src/validators/menuValidator.js
const { body, validationResult } = require('express-validator');

// Aturan validasi untuk membuat menu baru
exports.createMenuValidationRules = () => {
    return [
        body('nama')
            .notEmpty().withMessage('Nama menu tidak boleh kosong'),
        
        body('harga')
            .notEmpty().withMessage('Harga tidak boleh kosong')
            .isFloat({ gt: 0 }).withMessage('Harga harus berupa angka dan lebih besar dari 0'),
            
        body('kategori')
            .notEmpty().withMessage('Kategori tidak boleh kosong'),
    ];
};

// Aturan validasi untuk memperbarui menu
exports.updateMenuValidationRules = () => {
    return [
        body('nama')
            .optional()
            .notEmpty().withMessage('Nama menu tidak boleh kosong'),
            
        body('harga')
            .optional()
            .isFloat({ gt: 0 }).withMessage('Harga harus berupa angka dan lebih besar dari 0'),
            
        body('kategori')
            .optional()
            .notEmpty().withMessage('Kategori tidak boleh kosong'),
    ];
};


// Middleware untuk mengecek hasil validasi (bisa kita copy dari authValidator)
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