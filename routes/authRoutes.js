const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/register', authController.register);
router.post('/login', authController.login);
// Thêm API tạo admin
router.post('/create-admin', authController.createAdmin); 

module.exports = router;