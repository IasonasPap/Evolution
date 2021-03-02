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
        const isAdmin = decodedToken.isAdmin;
        if (req.body.userId && req.body.userId !== userId) {
            res.status(401).json({
                message: "Invalid token!"
            });
        } 
        else if (!isAdmin) {
            res.status(401).json({
                message: "This user is not an admin!"
            });
        }
        else {
            next();
        }
    } catch(error){
        res.status(401).json({
            message: "Please login to continue!"
        });
        
        next(error);
    }
};
