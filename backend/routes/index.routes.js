const express = require('express');
const userRoutes = require('./user.routes');
const adminRoutes = require('./admin.routes');
const chargingSessionRoutes = require('./chargingSession.routes');

const router = express.Router();

router.use('/users', userRoutes);
router.use('/admin', adminRoutes);
router.use('/', chargingSessionRoutes);

module.exports = router;