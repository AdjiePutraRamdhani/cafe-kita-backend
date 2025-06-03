// src/routes/userRoutes.js
const express = require('express');
const userController = require('../controllers/userController');
const { protect, restrictTo } = require('../middleware/authMiddleware');
// Impor aturan validasi
const { createUserValidationRules, updateUserValidationRules, validate } = require('../validators/userValidator');

const router = express.Router();

router.use(protect, restrictTo('ADMIN'));

router.route('/')
    .get(userController.getAllUsers)
    .post(
        createUserValidationRules(),
        validate,
        userController.createUser
    );

router.route('/:id')
    .get(userController.getUserById)
    .patch(
        updateUserValidationRules(),
        validate,
        userController.updateUser
    )
    .delete(userController.deleteUser);

module.exports = router;