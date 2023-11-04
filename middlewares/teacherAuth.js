import jwt from 'jsonwebtoken';

const checkUserRole = async (req, res, next) => {
    try {
        const token = req.headers['authorization'].split(' ')[1];

        if (!token) {
            return res.status(401).json({ message: 'Access denied. No token provided.' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        const userRole = decoded.accessLevel;

        if (userRole !== 'teacher') {
            return res.status(403).json({ message: 'Access denied. Insufficient permissions.' });
        }

        req.userRole = userRole;
        next(); // Call next to proceed to the next middleware or the actual route handler
    } catch (err) {
        return res.status(401).json({ message: 'Invalid token.' });
    }
};

export default checkUserRole;
