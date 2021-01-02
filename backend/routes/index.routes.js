const express = require('express');
const userRoutes = require('./user.routes');
const adminRoutes = require('./admin.routes');
const chargingSessionRoutes = require('./chargingSession.routes');
const authController = require('../controllers/auth.controller');

const router = express.Router();

router.use('/users', userRoutes);
router.use('/admin', adminRoutes);
router.use('/', chargingSessionRoutes);

router.post('/login', authController.login);
router.post('/logout', authController.logout);

module.exports = router;