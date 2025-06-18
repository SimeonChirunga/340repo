const invModel = require("../models/inventory-model")
const Util = {}
const jwt = require("jsonwebtoken")
require("dotenv").config()
const accountModel = require("../models/account-model")
const accountMessage = require("../models/messageModel")


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

Util.buildClassificationOptions = async function(classification_id = null) {
  let data = await invModel.getClassifications();
  let options = '';
  
  data.rows.forEach((row) => {
    options += `<option value="${row.classification_id}"`;
    if (classification_id != null && row.classification_id == classification_id) {
      options += ' selected';
    }
    options += `>${row.classification_name}</option>`;
  });
  
  return options;
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

/* **************************************
* Build Inbox messages table
* ************************************ */
Util.buildInboxTable = async function(data) {
  try {
    // Debug: Log raw input data
    console.log('Raw inbox data:', data);
    
    let table = '';
    
    if (!data || !Array.isArray(data)) {
      console.error('Invalid data format received');
      return '<div class="error">Error: Invalid message data</div>';
    }

    // Filter only non-archived messages
    const inboxMessages = data.filter(row => {
      // Debug each message's archived status
      console.log(`Message ${row.message_id || 'N/A'}:`, {
        archived: row.message_archived,
        subject: row.message_subject
      });
      return row.message_archived === false;
    });

    // Debug: Log filtered results
    console.log(`Filtered messages: ${inboxMessages.length} of ${data.length}`);

    if (inboxMessages.length > 0) {
      table = '<table id="inboxTable" class="message-table">';
      table += '<thead><tr>';
      table += '<th>Received</th>';
      table += '<th>Subject</th>';
      table += '<th>From</th>';
      table += '<th>Read</th>';
      table += '</tr></thead>';
      table += '<tbody>';

      inboxMessages.forEach(row => {
        try {
          // Safely handle date formatting
          let dateString;
          try {
            const date = new Date(row.message_created);
            dateString = date.toLocaleString('en-US', { 
              timeZone: 'UTC',
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            });
          } catch (e) {
            console.error('Date formatting error:', e);
            dateString = 'Date unavailable';
          }

          // Build table row
          table += `<tr class="${row.message_read ? '' : 'unread'}">`;
          table += `<td>${dateString}</td>`;
          table += `<td><a href="/message/messageView/${row.message_id}">${row.message_subject || 'No subject'}</a></td>`;
          table += `<td>${row.account_firstname || ''} ${row.account_lastname || ''}</td>`;
          table += `<td>${row.message_read ? '✓' : '✗'}</td>`;
          table += '</tr>';
        } catch (rowError) {
          console.error('Error processing row:', rowError, row);
        }
      });

      table += '</tbody></table>';
    } else {
      if (data.length > 0) {
        table = '<div class="notice">All messages are archived</div>';
      } else {
        table = '<div class="notice">Your inbox is empty</div>';
      }
    }

    return table;
  } catch (error) {
    console.error('Error building inbox table:', error);
    return '<div class="error">Error loading messages</div>';
  }
};

/* **************************************
* Build Unread Messages number
* ************************************ */
Util.buildUnreadMessages = async function (data) {
  let number
  let count = 0
     data.forEach(row =>{
    if(row.message_read === false){
    count++
    number = `<li> You have ${count} unread messages. </li>`
    }   
     })

     return number;
}

/* **************************************
* Build Archived Messages number
* ************************************ */
Util.buildArchivedMessagesNumber = async function (data) {
let archived 
let count = 0
data.forEach( row => {
if(row.message_archived === true) {
count++
archived = `<li><a href="/message/archived/">View ${count} Archived Message(s)</a></li>`
} 
})
return archived;
}

/* **************************************
* Build Archived messages table
* ************************************ */
Util.buildArchivedTable = async function (data) {
 
  let table
  if(data.length > 0){
  table = '<table id="inboxTable">'
  table += '<tr>'
  table += '<th> Received </th>'
  table += '<th> Subject </th>'
  table += '<th> From </th>'
  table += '<th> Read </th>'
  table += '</tr>'
  data.forEach(row => {
  if(row.message_archived === true){
  table += '<tr>'
  const time = row.message_created
  table += `<td> ${time.toLocaleString('en-US', { timeZone: 'UTC'})} </td>`
  table += `<td><a href="/message/messageView/${row.message_id}">${row.message_subject}</a></td>`
  table += `<td> ${row.account_firstname} ${row.account_lastname}</td>`
  table += `<td> ${row.message_read} </td>`
  table += '</tr>'
  }
  })
  table += '</table>'

}else {
 table = '<h3 id="noMessages">You do not have messages </h3>'
}
return table
}

/* **************************************
* Build account name options
* ************************************ */
Util.buildAccountOptions = async function (id) {
  let data = await accountMessage.getAllAccountData()
  let options
    options = '<select name="message_to" id="message_to" required>'
    options += '<option value="" selected disabled hidden> Select a recipient </option>'
    data.rows.forEach(row => {
    if(id != row.account_id){
      options += `<option value="${row.account_id}"> ${row.account_firstname} ${row.account_lastname} </option>`
    }
    })
    options += '</select>'
  return options
}

/* **************************************
* Build message view 
* ************************************ */
Util.buildMessageView = async function(data) {
  if (!data) return ''; // Handle null case
  
  let messageView = '<div id="messageview">';
  
  // Handle both single object and array cases
  const rows = Array.isArray(data) ? data : [data];
  
  rows.forEach(row => {
    messageView += `
      <p><strong>Subject: </strong><span>${row.message_subject}</span></p>
      <p><strong>From: </strong><span>${row.account_firstname} ${row.account_lastname}</span></p>
      <p><strong>Message: </strong></p>
      <p id="messageB">${row.message_body || 'No content available'}</p>
    `;
  });
  
  messageView += '</div>';
  return messageView;
}

/* **************************************
* Build reply input form
* ************************************ */
Util.replyForm = async function(data) {
  if (!data) return ''; // Handle null case

  let reply = '';
  
  // Convert single object to array if needed
  const rows = Array.isArray(data) ? data : [data];

  rows.forEach(row => {
    const substr = 'RE:';
    const subject = row.message_subject.startsWith(substr) 
      ? row.message_subject 
      : `${substr} ${row.message_subject}`;

    reply = `
      <label>
        To
        <input type="hidden" name="message_to" id="message_to" value="${row.message_from}">
        <input type="text" name="to" value="${row.account_firstname} ${row.account_lastname}" readonly>
      </label>
      <label>
        Subject
        <input type="text" name="message_subject" id="message_subject" value="${subject}" readonly>
      </label>
    `;
  });

  return reply;
}



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