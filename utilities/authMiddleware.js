const jwt = require('jsonwebtoken');
const utilities = require('./index');

function checkInventoryAccess(req, res, next) {
  try {
    // 1. Check for JWT token
    const token = req.cookies.jwt;
    if (!token) {
      req.flash('notice', 'Please log in to access this feature');
      return res.redirect('/account/login');
    }

    // 2. Verify the token
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) {
        req.flash('notice', 'Session expired. Please log in again');
        return res.redirect('/account/login');
      }

      // 3. Check account type
      if (decoded.account_type === 'Employee' || decoded.account_type === 'Admin') {
        req.accountData = decoded; // Attach account data to request
        next();
      } else {
        req.flash('notice', 'You do not have sufficient privileges');
        res.redirect('/account/login');
      }
    });
  } catch (error) {
    utilities.handleErrors(error, req, res);
  }
}

module.exports = { checkInventoryAccess };