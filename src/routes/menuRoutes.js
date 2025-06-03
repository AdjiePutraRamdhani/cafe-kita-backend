// src/routes/menuRoutes.js
const express = require('express');
const menuController = require('../controllers/menuController');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const { createMenuValidationRules, updateMenuValidationRules, validate } = require('../validators/menuValidator');

const router = express.Router();

// GET bisa diakses publik
router.route('/')
    .get(menuController.getAllMenuItems)
    .post(
        protect,
        restrictTo('ADMIN'),
        createMenuValidationRules(),
        validate,
        menuController.createMenuItem
    );

router.route('/:id')
    .get(menuController.getMenuItemById) // GET by ID juga bisa publik
    .patch(
        protect,
        restrictTo('ADMIN'),
        updateMenuValidationRules(),
        validate,
        menuController.updateMenuItem
    )
    .delete(
        protect,
        restrictTo('ADMIN'),
        menuController.deleteMenuItem
    );

module.exports = router;