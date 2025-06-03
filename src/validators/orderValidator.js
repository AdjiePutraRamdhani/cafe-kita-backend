// src/validators/orderValidator.js
const { body, validationResult } = require('express-validator');

// Aturan validasi untuk membuat pesanan baru
exports.createOrderValidationRules = () => {
    return [
        body('customerName')
            .optional({ checkFalsy: true }) // Boleh kosong atau null
            .isString().withMessage('Nama pelanggan harus berupa teks'),

        body('tableNumber')
            .optional({ checkFalsy: true })
            .isInt().withMessage('Nomor meja harus berupa angka'),

        body('items')
            .isArray({ min: 1 }).withMessage('Pesanan harus memiliki setidaknya satu item.'),

        // Validasi setiap elemen di dalam array 'items'
        body('items.*.menuId')
            .notEmpty().withMessage('menuId di setiap item tidak boleh kosong')
            .isInt().withMessage('menuId harus berupa angka.'),
            
        body('items.*.quantity')
            .notEmpty().withMessage('quantity di setiap item tidak boleh kosong')
            .isInt({ gt: 0 }).withMessage('quantity harus berupa angka lebih besar dari 0.'),
    ];
};

// Aturan validasi untuk update status pesanan
exports.updateStatusValidationRules = () => {
    return [
        body('status')
            .notEmpty().withMessage('Status tidak boleh kosong.')
            .isIn(['PENDING', 'COMPLETED', 'CANCELLED']).withMessage("Status tidak valid. Pilih 'PENDING', 'COMPLETED', atau 'CANCELLED'.")
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