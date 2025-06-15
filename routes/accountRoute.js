// Needed Resources
const express = require("express");
const router = express.Router();
const utilities = require("../utilities/");
const accountController = require('../controllers/accountController');
const regValidate = require('../utilities/account-validation');
const { checkInventoryAccess } = require("../utilities/authMiddleware"); 

// GET Routes ============================================================

// Login View
router.get("/login", 
  utilities.handleErrors(accountController.buildLogin));

// Registration View
router.get("/register", 
  utilities.handleErrors(accountController.buildRegister));

// Account Management (protected)
router.get("/", 
  utilities.checkLogin, 
  utilities.handleErrors(accountController.buildManagement));

// Logout Process (protected)
router.get("/logout", 
  utilities.checkLogin, 
  utilities.handleErrors(accountController.logoutProcess));

// Update Account View (protected)
router.get("/update/:accountId", 
  utilities.checkLogin,
  //utilities.checkAccountOwnership, // Add if users should only edit their own account
  utilities.handleErrors(accountController.updateAccountView));

// Inventory Management View (protected for Employees/Admins)
router.get("/inventory", 
  utilities.checkLogin,
  checkInventoryAccess, // New authorization middleware
  utilities.handleErrors(accountController.buildInventoryManagement));

// POST Routes ===========================================================

// Process Registration
router.post(
  "/register",
  regValidate.registrationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
);

// Process Login
router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
);

// Process Account Update (protected)
router.post(
  "/update/account",
  utilities.checkLogin,
  regValidate.updateRules(),
  regValidate.checkUpdateData,
  utilities.handleErrors(accountController.updateAccount)
);

// Process Password Update (protected)
router.post(
  "/update/updatePassword",
  utilities.checkLogin,
  regValidate.upPassRules(),
  regValidate.checkPassData,
  utilities.handleErrors(accountController.processUpPassword)
);

// Inventory Management Actions (protected for Employees/Admins)
router.post(
  "/inventory/add-vehicle",
  utilities.checkLogin,
  checkInventoryAccess,
  utilities.handleErrors(accountController.addVehicle)
);

module.exports = router;