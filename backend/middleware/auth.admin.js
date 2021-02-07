const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        const token = req.headers['x-observatory-auth'];
        if (!token){
            res.status(401).json({
                message: "Missiong token!"
            });
            next(new Error());
        }
        const decodedToken = jwt.verify(token, 'RANDOM_TOKEN_SECRET');
        const user = decodedToken.user;
        if (req.body.userId && req.body.userId !== user.id) {
            res.status(401).json({
                message: "Invalid token!"
            });
        } 
        else if (!user.isAdmin) {
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
