const utilities = require(".")
//const { body, validationResult } = require("express-validator")
const { body , validationResult} = require('express-validator');
const accountModel = require("../models/account-model")
const validate = {}
  
/*  **********************************
  *  Registration Data Validation Rules
  * ********************************* */
validate.registrationRules = () => {
    return [
      // firstname is required and must be string
      body("account_firstname")
        .trim()
        .escape()
        .notEmpty()
        .isLength({ min: 1 })
        .withMessage("Please provide a first name."), // on error this message is sent.
  
      // lastname is required and must be string
      body("account_lastname")
        .trim()
        .escape()
        .notEmpty()
        .isLength({ min: 2 })
        .withMessage("Please provide a last name."), // on error this message is sent.
  
      // valid email is required and cannot already exist in the database
        body("account_email")
        .trim()
        .isEmail()
        .normalizeEmail() // refer to validator.js docs
        .withMessage("A valid email is required.")
        .custom(async (account_email) => {
          const emailExists = await accountModel.checkExistingEmail(account_email)
          if (emailExists){
            throw new Error("Email exists. Please log in or use different email")
          }
        }),
      // password is required and must be strong password
      body("account_password")
        .trim()
        .notEmpty()
        .isStrongPassword({
          minLength: 12,
          minLowercase: 1,
          minUppercase: 1,
          minNumbers: 1,
          minSymbols: 1,
        })
        .withMessage("Password does not meet requirements."),
    ]
}
  
/* ******************************
 * Check data and return errors or continue to registration
 * ***************************** */
validate.checkRegData = async (req, res, next) => {
    const { account_firstname, account_lastname, account_email } = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
      let nav = await utilities.getNav()
      res.render("account/register", {
        errors,
        title: "Registration",
        nav,
        account_firstname,
        account_lastname,
        account_email,
      })
      return
    }
    next()
}
  /*  **********************************
  *  Registration Login Rules
  * ********************************* */
  validate.loginRules = () => {
    return [
      // valid email is required and cannot already exist
      body("account_email")
        .trim()
        .isEmail()
        .normalizeEmail()
        .withMessage("A valid email is required.")
        .custom(async (account_email) => {
          const emailExists = await accountModel.checkExistingEmail(
            account_email
          );
          if (!emailExists) {
            throw new Error("Email does not exist. Please register.");
          }
        }),
  
      // password is required and must be strong password
      body("account_password")
        .trim()
        .isStrongPassword({
          minLength: 12,
          minLowercase: 1,
          minUppercase: 1,
          minNumbers: 1,
          minSymbols: 1,
        })
        .withMessage("Password is not correct."),
    ]
  };
 /* ******************************
  * Check data and return errors or continue to login
  * ***************************** */
 validate.checkLoginData = async (req, res, next) => {
   const { account_email, account_password } = req.body;
   let errors = [];
   errors = validationResult(req);
   if (!errors.isEmpty()) {
     let nav = await utilities.getNav();
     res.render("account/login", {
       errors,
       title: "Login",
       nav,
       account_email,
       account_password,
     });
     return;
   }
   next();
};
 
/*  **********************************
 *  Update Validation Rules
 * ********************************* */


validate.updateRules = () => {
    return [
        // First name validation
        body("account_firstname")
            .trim()
            .isLength({ min: 1 })
            .withMessage("Please provide a first name.")
            .escape(), // Sanitize against XSS

        // Last name validation
        body("account_lastname")
            .trim()
            .isLength({ min: 2 })
            .withMessage("Please provide a last name (minimum 2 characters).")
            .escape(),

        // Email validation
        body("account_email")
            .trim()
            .isEmail()
            .withMessage("A valid email is required.")
            .normalizeEmail()
            .custom(async (account_email, { req }) => {
                // Get current account data
                const account = await accountModel.getAccountById(req.body.account_id);
                
                // Skip uniqueness check if email hasn't changed
                if (account.account_email === account_email) {
                    return true;
                }
                
                // Check if new email already exists
                const emailExists = await accountModel.checkExistingEmail(account_email);
                if (emailExists) {
                    throw new Error("Email already in use. Please use a different email.");
                }
                
                return true;
            })
    ];
};

/*******************
 * Update password rules
 *******************/
validate.upPassRules = () => {
    return [

        //account id is required and must be an integer
        body("account_id")
        .trim()
        .isInt(),

        //password is required and must be a strong password
        body("account_password")
        .trim()
        .isStrongPassword({
            minLength: 12,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1,
        })
        .withMessage("Password does not meet requirements."),
    ]
}

/* ******************************
 * Check data and return errors or continue to update password
 * ***************************** */
validate.checkPassData = async (req, res, next) => {
    const { account_id, account_password } = req.body
    let errors = []
    errors = validationResult(req)
    if(!errors.isEmpty()) {
     let nav = await utilities.getNav()
     res.render("./account/update", {
        errors,
        title: "Edit Account",
        nav,
        account_id,
        account_password,
     })
     return
    }
    next()
}

validate.checkUpdateData = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
      let nav = await utilities.getNav();
      const accountData = await accountModel.getAccountById(req.body.account_id);
      
      return res.render("account/update-view", {
          title: "Update Account",
          nav,
          errors: errors.array(),
          accountData: {
              ...accountData,
              ...req.body // Override with submitted values
          }
      });
  }
  next();
};


 
  module.exports = validate