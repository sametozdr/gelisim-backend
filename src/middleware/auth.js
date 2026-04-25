const admin = require('../config/firebase');
const { User } = require('../models');

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'No token provided'
    });
  }

  const idToken = authHeader.split('Bearer ')[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    
    // Attach UID and email to request
    req.user = {
      firebase_uid: decodedToken.uid,
      email: decodedToken.email
    };

    // Find local user record to get internal ID and role
    const localUser = await User.findOne({
      where: { firebase_uid: decodedToken.uid }
    });

    if (localUser) {
      req.user.id = localUser.id;
      req.user.role = localUser.role;
      req.user.full_name = localUser.full_name;
    }

    next();
  } catch (error) {
    console.error('Token verification error:', error.message);
    return res.status(403).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

const checkRole = (roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access for this role'
      });
    }
    next();
  };
};

module.exports = { verifyToken, checkRole };
