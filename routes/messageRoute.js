// Needed Resources
const express = require("express")
const router = new express.Router()
const utilities = require("../utilities")
const messageController = require("../controllers/messageController")
const regValidate = require("../utilities/messageValidation")

// Route to Inbox view
router.get("/inbox/", utilities.checkLogin, utilities.handleErrors(messageController.inboxView))

// Route to New Message view
router.get("/newMessage/", utilities.checkLogin, utilities.handleErrors(messageController.newMessageView))

// Route to Archived Message view
router.get("/archived/", utilities.checkLogin, utilities.handleErrors(messageController.archivedMessageView))

// Route to Message view
router.get("/messageView/:messageId", utilities.checkLogin, utilities.handleErrors(messageController.messageView))

// Process add new message
router.post(
    "/inbox/",
    regValidate.newMessageRules(),
    regValidate.checkNewMessage,
    utilities.checkLogin,
    utilities.handleErrors(messageController.addMessage)
)

// Process mark as read
router.post(
"/messageView/read",
regValidate.buttonRules(),
regValidate.checkButton,
utilities.checkLogin,
utilities.handleErrors(messageController.markAsRead)
)

// Process archive
router.post(
"/messageView/archived",
regValidate.buttonRules(),
regValidate.checkButton,
utilities.checkLogin,
utilities.handleErrors(messageController.markAsArchived)
)

// Process delete
router.post(
"/messageView/delete",
regValidate.buttonRules(),
regValidate.checkButton,
utilities.checkLogin,
utilities.handleErrors(messageController.deleteMessage)
)

// Process Reply
router.post(
"/messageView/reply",
regValidate.newMessageRules(),
regValidate.checkReply,
utilities.checkLogin, 
utilities.handleErrors(messageController.replyMessage)
)


module.exports = router;