const express = require('express');
const userRoutes = require('./user.routes');
const adminRoutes = require('./admin.routes');
const chargingSessionRoutes = require('./chargingSession.routes');
const authController = require('../controllers/auth.controller');
const { chargingSession } = require('../models');

const router = express.Router();

router.use('/users', userRoutes);
router.use('/admin', adminRoutes);
router.use('/', chargingSessionRoutes);

router.use('/posts', (req, res) => {
    chargingSession.findAll()
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message:
                    err.message || "Some error occurred while retrieving users."
            });
        });
})

router.post('/login', authController.login);
router.post('/logout', authController.logout);

module.exports = router;