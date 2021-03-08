const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        const token = req.headers['x-observatory-auth'];
        if (!token){
            res.status(401).json({
                message: "Missing token!"
            });
            next(new Error());
        }
        const decodedToken = jwt.verify(token, 'RANDOM_TOKEN_SECRET');
        const userId = decodedToken.userId;
        if (req.body.userId && req.body.userId !== userId) {
            res.status(401).json({
                message: "Invalid token!"
            });
        } else {
            next();
        }
    } catch (error) {
        const token = req.headers['x-observatory-auth'];
        let message = "Please login to continue";
        jwt.verify(token, 'RANDOM_TOKEN_SECRET', (err) => {
            if(err && err.name === 'TokenExpiredError') {
                message = "Session Expired";
            }
        });
        res.status(401).json({
            message: message
        });
        
        next(error);
    }
};
