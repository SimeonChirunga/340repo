const invModel = require("../models/inventory-model")
const Util = {}
const jwt = require("jsonwebtoken")
require("dotenv").config()
const accountModel = require("../models/account-model")


/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
  let data = await invModel.getClassifications()
  
  let list = "<ul>"
  list += '<li><a href="/" title="Home page">Home</a></li>'
  data.rows.forEach((row) => {
    list += "<li>"
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>"
    list += "</li>"
  })
  list += "</ul>"
  return list
}


/* **************************************
* Build the classification view HTML
* ************************************ */
Util.buildClassificationGrid = async function(data){
    let grid
    if(data.length > 0){
      grid = '<ul id="inv-display">'
      data.forEach(vehicle => { 
        grid += '<li>'
        grid +=  '<a href="../../inv/detail/'+ vehicle.inv_id 
        + '" title="View ' + vehicle.inv_year + ' '+ vehicle.inv_make + ' '+ vehicle.inv_model 
        + 'details"><img src="' + vehicle.inv_thumbnail 
        +'" alt="Image of '+ vehicle.inv_make + ' ' + vehicle.inv_model 
        +' on CSE Motors" /></a>'
        grid += '<div class="namePrice">'
        grid += '<hr />'
        grid += '<h2>'
        grid += '<a href="../../inv/detail/' + vehicle.inv_id +'" title="View ' 
        + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">' 
        + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>'
        grid += '</h2>'
        grid += '<span>$' 
        + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>'
        grid += '</div>'
        grid += '</li>'
      })
      grid += '</ul>'
    } else { 
      grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>'
    }
    return grid
}
  
/* **************************************
 * Build the detail view HTML
 * ************************************ */
Util.buildDetailView = async function (vehicle) {
  const formatter = new Intl.NumberFormat("en-US");

  const html = `
    <div class="vehicle-detail">
      <img src="${vehicle.inv_image}" alt="Image of ${vehicle.inv_make} ${
    vehicle.inv_model
  }" />
      <div class="vehicle-detail-text">
        <p>${vehicle.inv_make} ${vehicle.inv_model} Details </p>
        <p>Price: $${formatter.format(vehicle.inv_price)}</p>
        <p>Description: ${vehicle.inv_description}</p>
        <p>Color: ${vehicle.inv_color}</p>
        <p>Miles: ${formatter.format(vehicle.inv_miles)} </p>
        <button>Buy Now</button>
      </div>
    </div>
  `;
  return html;
};


Util.buildClassificationList = async function (classification_id = null) {
  let data = await invModel.getClassifications()
  let classificationList =
    '<select name="classification_id" id="classificationList" required>'
  classificationList += "<option value=''>Choose a Classification</option>"
  data.rows.forEach((row) => {
    classificationList += '<option value="' + row.classification_id + '"'
    if (
      classification_id != null &&
      row.classification_id == classification_id
    ) {
      classificationList += " selected "
    }
    classificationList += ">" + row.classification_name + "</option>"
  })
  classificationList += "</select>"
  return classificationList
}

/* **************************************
 * Build the classification dropdown
 * ************************************ */
Util.buildDropdown = async function () {
  let classifications = await invModel.getClassifications();
  const dropdownOptions = classifications.rows
    .map((classification) => {
      return `<option value="${classification.classification_id}">${classification.classification_name}</option>`;
    })
    .join("");

  const dropdown = `
    <select id="classification-id" name="classification_id">
      ${dropdownOptions}
    </select>
  `;

  return dropdown;
};





/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

/* ****************************************
* Middleware to check token validity
**************************************** */
Util.checkJWTToken = (req, res, next) => {
  if (req.cookies.jwt) {
   jwt.verify(
    req.cookies.jwt,
    process.env.ACCESS_TOKEN_SECRET,
    function (err, accountData) {
     if (err) {
      req.flash("Please log in")
      res.clearCookie("jwt")
      return res.redirect("/account/login")
     }
     res.locals.accountData = accountData
     res.locals.loggedin = 1
     next()
    })
  } else {
   next()
  }
}
 
/* ****************************************
 *  Check Login
 * ************************************ */
Util.checkLogin = (req, res, next) => {
  if (res.locals.loggedin) {
    next()
  } else {
    req.flash("notice", "Please log in.")
    return res.redirect("/account/login")
  }
 }

 Util.checkPermission = (req, res, next) => {
  const type = res.locals.accountData.account_type
  if(type == "Client") {
    return res.redirect("/account/")
  } else {
    next()
  }
}

Util.checkInventoryAccess = (req, res, next) => {
  try {
    const token = req.cookies.jwt
    if (!token) {
      req.flash("notice", "You do not have permission to access this page. Please log in with a valid account.")
      return res.redirect("/account/login")
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) {
        req.flash("notice", "You do not have permission to access this page. Please log in with a valid account.")
        return res.redirect("/account/login")
      }

      if (decoded.account_type !== "Employee" && decoded.account_type !== "Admin") {
        req.flash("notice", "You do not have permission to access this page.")
        return res.redirect("/account/")
      }

      res.locals.accountData = decoded
      res.locals.loggedin = true
      next()
    })
  } catch (error) {
    req.flash("notice", "You do not have permission to access this page. Please log in with a valid account.")
    res.redirect("/account/login")
  }
}












module.exports = Util