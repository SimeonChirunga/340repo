const utilities = require(".")
const messageModel = require("../models/messageModel")
const { body, validationResult } = require("express-validator")
const validate = {}

/*  **********************************
 *  New Message Validation Rules
 * ********************************* */
validate.newMessageRules = () => {
    return [

    body("message_to")
    .isNumeric({min: 1})
    .withMessage("Please, choose a recipient."),
    
    body("message_subject")
    .isLength({min: 3})
    .withMessage("Subject field does not meet requirements"),

    body("message_body")
    .isLength({min: 3})
    .withMessage("Message field does not meet requirements"),

    body("account_id")
    .isNumeric({min: 1})
    .withMessage("Invalid value")
    ]
}

/*  **********************************
 *  Check data and return errors or continue to create New Message
 * ********************************* */
validate.checkNewMessage = async (req, res, next) => {
const { message_to, message_subject, message_body, account_id } = req.body
let errors = []
errors = validationResult(req)
if(!errors.isEmpty()) {
let nav = await utilities.getNav()
let options = await utilities.buildAccountOptions(account_id)
res.render("./message/newMessage", {
errors,
title: "New Message",
nav,
options, 
message_to,
message_subject,
message_body,
account_id,  
})
return
}
next()
}


/*  **********************************
 *  Check data and return errors or continue to reply
 * ********************************* */
validate.checkReply = async (req, res, next) => {
    const { message_to, message_subject, message_body, account_id, message_id} = req.body
    let errors = []
    errors = validationResult(req)
    if(!errors.isEmpty()) {
    let nav = await utilities.getNav()
    const newData = await messageModel.getMessageById(message_id, account_id)
    const inboxMessage = await utilities.buildMessageView(newData)
    const reply = await utilities.replyForm(newData)
    const messageSub = newData?.message_subject || 
        newData[0]?.message_subject || 
        "No Subject";
    //const messageSub = `${newData[0].message_subject}`
    res.render("./message/messageView", {
    errors,
    title: messageSub,
    nav,
    inboxMessage,
    reply,
    message_to,
    message_subject,
    message_body,
    account_id,  
    })
    return
    }
    next()
    }


/*  **********************************
 *  Mark as Read, Archive and Delete Button validation
 * ********************************* */
validate.buttonRules = () => {
    return [


    body("message_id")
    .isNumeric({min: 1})
    .withMessage("Invalid value"),

    body("account_id")
    .isNumeric({min: 1})
    .withMessage("Invalid value")


    ]
}


/*  **********************************
 *  Check data and return errors or continue to mark as read, archive or delete message
 * ********************************* */
validate.checkButton = async (req, res, next) => {
    const { message_id, account_id } = req.body
    let errors = []
    errors = validationResult(req)
    if(!errors.isEmpty()) {
    let nav = await utilities.getNav()
    const newData = await messageModel.getMessageById(message_id)
    const inboxMessage = await utilities.buildMessageView(newData)
    const messageSub = `${newData[0].message_subject}`
    res.render("message/messageView", {
    errors,
    title: messageSub,
    nav,
    inboxMessage,
    message_id,
    account_id,
    })
    return
    }
    next()
    }


module.exports = validate