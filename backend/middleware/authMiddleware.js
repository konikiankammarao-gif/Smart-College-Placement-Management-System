const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'smart_placement_default_secure_jwt_secret_key_2025';

const DEMO_LIST = [
  { _id: '665000000000000000000001', name: 'Super Admin', email: 'admin@smartplacement.com', role: 'SUPER_ADMIN', phone: '9000000000', isActive: true, isVerified: true },
  { _id: '665000000000000000000002', name: 'Placement Officer', email: 'officer@smartplacement.com', role: 'PLACEMENT_OFFICER', phone: '9000000001', isActive: true, isVerified: true },
  { _id: '665000000000000000000003', name: 'Rahul Sharma', email: 'rahul.cse@college.edu', role: 'STUDENT', phone: '9000000010', isActive: true, isVerified: true },
  { _id: '665000000000000000000004', name: 'Google Recruiter', email: 'recruiter@google.com', role: 'COMPANY', phone: '9000000020', isActive: true, isVerified: true },
  { _id: '665000000000000000000005', name: 'Arjun Sharma', email: 'arjun@student.com', role: 'STUDENT', phone: '9111111111', isActive: true, isVerified: true },
  { _id: '665000000000000000000006', name: 'TechCorp Recruiter', email: 'hr@techcorp.com', role: 'COMPANY', phone: '9222222221', isActive: true, isVerified: true },
];

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const mongoose = require('mongoose');
    let user = null;

    if (mongoose.connection.readyState === 1) {
      try {
        user = await User.findById(decoded.id).select('-password');
      } catch (err) {
        user = null;
      }
    }

    if (!user) {
      user = DEMO_LIST.find(u => String(u._id) === String(decoded.id));
    }

    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    if (!user.isActive) {
      return res.status(401).json({ success: false, message: 'Account is suspended' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
  }
};

module.exports = { protect, JWT_SECRET };
