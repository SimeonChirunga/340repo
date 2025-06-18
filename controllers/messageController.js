const utilities = require("../utilities")
const messageModel = require("../models/messageModel")
const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const invCont = require("./invController")
require("dotenv").config()


/* ****************************************
*  Account Inbox View
* *************************************** */
async function inboxView(req, res, next) {
  let account_id = res.locals.accountData.account_id
  
    let nav = await utilities.getNav()
    const itemData = await accountModel.getAccountById(account_id)
    const accountName = `${itemData.account_firstname} ${itemData.account_lastname}`
    let data = await messageModel.getMessage(account_id)
    const table = await utilities.buildInboxTable(data)
    const archived = await utilities.buildArchivedMessagesNumber(data)
    res.render("message/inbox", {
      title: `${accountName} Inbox`,
      nav,
      table,
      archived,
      errors: null, 
    })
  
  }
  
  /* ****************************************
  *  New Message View
  * *************************************** */
  async function newMessageView(req, res, next) {
    let account_id = res.locals.accountData.account_id
    let nav = await utilities.getNav()
    const itemData = await accountModel.getAccountById(account_id)
    let options = await utilities.buildAccountOptions(account_id)
    res.render("message/newMessage", {
      title: "New Message",
      nav,
      options,
      errors: null,
    })
  }
  
  /* ****************************************
  *  Archived Message View
  * *************************************** */
  async function archivedMessageView(req, res, next) {
    let account_id = res.locals.accountData.account_id
    let nav = await utilities.getNav()
    const itemData = await accountModel.getAccountById(account_id)
    const accountName = `${itemData.account_firstname} ${itemData.account_lastname}`
    let data = await messageModel.getMessage(account_id)
    let table = await utilities.buildArchivedTable(data)
    res.render("message/archived", {
    title: `${accountName} Archives`,
    nav,
    table,
    errors: null,
    }) 
  }
  
  /* ****************************************
  *  Process add new message
  * *************************************** */
  async function addMessage(req, res) {
  const {message_to, message_subject, message_body, account_id} = req.body
  const addResult = await messageModel.addNewMessage(message_to, message_subject, message_body, account_id) 
  if(addResult){
  req.flash("notice", `Message sent successfully`) 
  res.status(201).redirect("/message/inbox/") 
  } else {
  req.flash("notice", `Failed to send the message`)
  res.status(501).redirect("message/newMessage/")
  }
  }
  
/* ****************************************
  *  Build message view
  * *************************************** */
async function messageView(req, res, next) {
  try {
    const message_id = parseInt(req.params.messageId);
    const account_id = res.locals.accountData.account_id;
    
    const message = await messageModel.getMessageById(message_id, account_id);
    if (!message) {
      return res.status(404).render("errors/notFound", { nav: await utilities.getNav() });
    }

    const nav = await utilities.getNav();
    res.render("message/messageView", {
      title: message.message_subject,
      nav,
      inboxMessage: await utilities.buildMessageView(message),
      reply: await utilities.replyForm(message),
      message_id: message.message_id,
      errors: null
    });
  } catch (error) {
    next(error);
  }
}



   /* ****************************************
  *  Process mark as read
  * *************************************** */
 async function markAsRead(req, res) {
const {message_id, account_id} = req.body
const markResult = await messageModel.messageRead(message_id)
if(markResult){
req.flash("notice", `Message marked as read`) 
res.status(201).redirect("/message/inbox/") 
} else {
req.flash("notice", `The operation failed`)
res.status(501).redirect("/message/messageView/"+message_id)
}
}

   /* ****************************************
  *  Process archive message
  * *************************************** */
   async function markAsArchived(req, res) {
    const {message_id, account_id} = req.body
    const markResult = await messageModel.archiveMessage(message_id)
    if(markResult){
    req.flash("notice", `Message archived`) 
    res.status(201).redirect("/message/inbox/") 
    } else {
    req.flash("notice", `The operation failed`)
    res.status(501).redirect("/message/messageView/"+message_id)
    }
    }

  /* ****************************************
  *  Process delete message
  * *************************************** */
   async function deleteMessage(req, res) {
    const {message_id, account_id} = req.body
    const markResult = await messageModel.deleteMessage(message_id)
    if(markResult){
    req.flash("notice", `Message deleted`) 
    res.status(201).redirect("/message/inbox/") 
    } else {
    req.flash("notice", `The operation failed`)
    res.status(501).redirect("/message/messageView/"+message_id)
    }
    }


    /* ****************************************
  *  Process reply message
  * *************************************** */
 async function replyMessage(req, res, next) {
  const {message_to, message_subject, message_body, account_id} = req.body
  const addResult = await messageModel.addNewMessage(message_to, message_subject, message_body, account_id) 
  if(addResult){
  req.flash("notice", `Message sent successfully`) 
  res.status(201).redirect("/message/inbox/") 
  } else {
  req.flash("notice", `Failed to send the message`)
  res.status(501).redirect("message/messageView/")
  }
 }


  module.exports = {inboxView, newMessageView, archivedMessageView, addMessage, messageView, markAsRead, markAsArchived, deleteMessage, replyMessage}