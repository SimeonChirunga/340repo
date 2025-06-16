const jwt = require('jsonwebtoken');
const utilities = require('./index');
const { promisify } = require('util');

// Convert jwt.verify to promise-based
const verifyAsync = promisify(jwt.verify);

async function checkInventoryAccess(req, res, next) {
  try {
    // 1. Check for JWT token
    const token = req.cookies.jwt;
    if (!token) {
      req.flash('notice', 'Please log in to access this feature');
      return res.redirect('/account/login');
    }

    // 2. Verify the token
    const decoded = await verifyAsync(token, process.env.ACCESS_TOKEN_SECRET);
    
    // 3. Check account type
    if (decoded.account_type === 'Employee' || decoded.account_type === 'Admin') {
      req.accountData = decoded; // Attach account data to request
      return next();
    }
    
    req.flash('notice', 'You do not have sufficient privileges');
    return res.redirect('/account/login');
    
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      req.flash('notice', 'Session expired. Please log in again');
      return res.redirect('/account/login');
    }
    
    if (error.name === 'JsonWebTokenError') {
      req.flash('notice', 'Invalid authentication token');
      return res.redirect('/account/login');
    }
    
    // For other errors
    console.error('Inventory access check error:', error);
    return utilities.handleErrors(error, req, res);
  }
}

module.exports = { checkInventoryAccess };