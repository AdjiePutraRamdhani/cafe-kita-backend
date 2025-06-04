// src/routes/orderRoutes.js
const express = require('express');
const orderController = require('../controllers/orderController');
const { protect, restrictTo } = require('../middleware/authMiddleware');
// Impor aturan validasi
const { createOrderValidationRules, updateStatusValidationRules, validate } = require('../validators/orderValidator');

const router = express.Router();

router.use(protect); // Lindungi semua route order

router.route('/')
    .post(
        createOrderValidationRules(),
        validate,
        orderController.createOrder
    )
    .get(orderController.getAllOrders);

router.route('/:id')
    .get(orderController.getOrderById);

router.route('/:id/status')
    .patch(
        restrictTo('KASIR', 'ADMIN'), // Bisa diupdate oleh admin atau kasir
        updateStatusValidationRules(),
        validate,
        orderController.updateOrderStatus
    );

module.exports = router;