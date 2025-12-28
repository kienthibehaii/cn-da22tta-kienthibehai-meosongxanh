const jwt = require('jsonwebtoken');
const SECRET_KEY = 'green_life_secret_key_pro';

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') 
    ? authHeader.slice(7) 
    : authHeader;
    
  if (!token) return res.status(403).json({ message: 'No token provided' });

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) return res.status(401).json({ message: 'Unauthorized' });
    req.user = { id: decoded.id, role: decoded.role };
    req.userId = decoded.id;
    req.userRole = decoded.role;
    next();
  });
};

module.exports = verifyToken;