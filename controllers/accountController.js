const utilities = require("../utilities/");
const accountModel = require("../models/account-model");
const messageModel = require("../models/messageModel")
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken")
require("dotenv").config()
const invCont = require("./invController")


/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav()
    res.render("account/login", {
      title: "Login",
      nav,
      errors: null
    })
}
  
/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null
  })
}

/* ****************************************
 *  Process Account Registration
 * *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav();
  const {
    account_firstname,
    account_lastname,
    account_email,
    account_password,
  } = req.body;

  // Hash the password before storing
  let hashedPassword;
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hash(account_password, 10);
  } catch (error) {
    req.flash(
      "notice",
      "Sorry, there was an error processing the registration."
    );
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    });
    return;
  }

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  );

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you\'re registered ${account_firstname}. Please log in.`
    );
    res.status(201).render("account/login", {
      title: "Login",
      nav,
      errors: null
    });
  } else {
    req.flash("notice", "Sorry, the registration failed.");
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
    });
  }
}

/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res, next) {
  let nav = await utilities.getNav();
  const { account_email, account_password } = req.body;
  
  try {
    // 1. Get account data
    const accountData = await accountModel.getAccountByEmail(account_email);
    
    if (!accountData) {
      req.flash("notice", "Invalid credentials");
      return res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email
      });
    }

    // 2. Verify password
    const passwordMatch = await bcrypt.compare(account_password, accountData.account_password);
    if (!passwordMatch) {
      req.flash("notice", "Invalid credentials");
      return res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email
      });
    }

    // 3. Create token payload (only include necessary data)
    const tokenPayload = {
      account_id: accountData.account_id,
      account_firstname: accountData.account_firstname,
      account_type: accountData.account_type, // Critical for authorization
      account_email: accountData.account_email
    };

    // 4. Generate JWT
    const accessToken = jwt.sign(
      tokenPayload,
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '1h' } // 1 hour expiration
    );

    // 5. Set secure cookie
    const cookieOptions = {
      httpOnly: true,
      maxAge: 3600000, // 1 hour
      secure: process.env.NODE_ENV !== 'development', // HTTPS in production
      sameSite: 'strict' // CSRF protection
    };
    
    res.cookie("jwt", accessToken, cookieOptions);
    
    // 6. Redirect based on account type
    if (['Employee', 'Admin'].includes(accountData.account_type)) {
      return res.redirect("/inv/");
    }
    return res.redirect("/account/");

  } catch (error) {
    error.status = 500;
    next(error); // Pass to error handler
  }
}


/* ****************************************
*  Deliver management view
* *************************************** */
async function buildManagement(req, res, next) {
    let nav = await utilities.getNav()
    let account_id = res.locals.accountData.account_id
    let data = await messageModel.getMessage(account_id)
    let number = await utilities.buildUnreadMessages(data)
    res.render("account/", {
      title: "Account Management",
      nav,
      number,
      errors: null,
    })
}


 /* ****************************************
 *  Logout
 * ************************************ */
 async function logoutProcess(req, res, next) {
  res.clearCookie("jwt");
  return res.redirect("/");
}

/* ****************************************
 *  Deliver Update view
 * ************************************ */
  async function updateAccountView(req, res, next) {
  const account_id = parseInt(req.params.accountId)
  let nav = await utilities.getNav()
  const itemData = await accountModel.getAccountById(account_id)
  res.render("account/update",{
  title: "Edit Account",
  nav,
  errors: null,
  account_firstname: itemData.account_firstname,
  account_lastname: itemData.account_lastname,
  account_email: itemData.account_email,
  account_id: itemData.account_id,
  })
  }

  /* ****************************************
*  Process Update Account
* *************************************** */
async function updateAccount(req, res, next) {
  try {
    let nav = await utilities.getNav();
    const { account_firstname, account_lastname, account_email, account_id } = req.body;
    
    // Validate required fields
    if (!account_firstname || !account_lastname || !account_email || !account_id) {
      req.flash("notice", "Please provide all required information.");
      return res.redirect("/account/update/" + account_id);
    }

    const upAccount = await accountModel.updateAccount(
      account_firstname, 
      account_lastname, 
      account_email, 
      account_id
    );

    if (upAccount) {
      const accountData = await accountModel.getAccountById(account_id);
      
      // Remove sensitive data before creating token
      delete accountData.account_password;
      
      // Clear old token and create new one
      res.clearCookie("jwt");
      const accessToken = jwt.sign(
        accountData, 
        process.env.ACCESS_TOKEN_SECRET, 
        { expiresIn: 3600 * 1000 }
      );
      
      res.cookie("jwt", accessToken, { 
        httpOnly: true, 
        maxAge: 3600 * 1000 
      });
      
      req.flash(
        "notice",
        `Congratulations ${account_firstname}, your information has been updated.`
      );
      return res.redirect("/account/");
    } else {
      req.flash("notice", "Sorry, the update failed.");
      return res.status(501).render("account/update", {
        title: "Edit Account Information",
        nav,
        errors: null,
        accountData: req.body
      });
    }
  } catch (error) {
    next(error);
  }
}
  /* ****************************************
*  Process Update Password
* *************************************** */
async function processUpPassword(req, res, next) {
  
  const { account_id, account_password } = req.body

    // Hash the password before storing
    let hashedPassword
    try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(account_password, 10)
    } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the update.')
     res.status(500).redirect("/account")
    }

    const upPassword = await accountModel.updatePassword(hashedPassword, account_id)

  if (upPassword) {
    req.flash(
      "notice",
      `Congratulations, your password was updated.`
    )
    res.status(201).redirect("/account")
    
  } else {

    req.flash("notice", "Sorry, the update failed.")
    res.status(501).redirect("/account/update/"+account_id)
  
  }

}

// In accountController.js
async function buildInventoryManagement(req, res) {
  let nav = await utilities.getNav();
  res.render("account/", {
    title: "Inventory Management",
    nav,
    errors: null,
  });
}










module.exports = { buildLogin, buildRegister, registerAccount, accountLogin, buildManagement, logoutProcess, updateAccountView, updateAccount, processUpPassword, buildInventoryManagement }




  