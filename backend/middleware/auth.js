const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        const token = req.headers['x-observatory-auth'];
        const decodedToken = jwt.verify(token, 'RANDOM_TOKEN_SECRET');
        const userId = decodedToken.userId;
        if (req.body.userId && req.body.userId !== userId) {
            res.status(401).json({
                message: "Invalid token!"
            });
        } else {
            next();
        }
    } catch {
        res.status(401).json({
            message: "Please login to continue"
        });
    }
};