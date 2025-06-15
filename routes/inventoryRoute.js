// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const utilities = require("../utilities");
const invValidate = require("../utilities/management-validation");


// Route to build inventory by classification view
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));

// Route for detail view
router.get("/detail/:inv_id", utilities.handleErrors(invController.buildById));

// Route for inv management
router.get("/", (req, res, next) => {
  utilities.checkInventoryAccess, utilities.handleErrors(invController.buildManageInventory)(req, res, next);
});

// Route to get Edit
//router.get("/edit-inventory/:inv_id",  utilities.checkInventoryAccess, utilities.handleErrors(invController.editInventoryView));
router.get("/edit-inventory/:inv_id",
  utilities.checkLogin,
  utilities.checkInventoryAccess,
  utilities.handleErrors(invController.buildEditInventory)
);



  
// Route for add classification page
router.get("/add-classification", (req, res, next) => {
  utilities.checkInventoryAccess,  utilities.handleErrors(invController.buildAddClassification)(req, res, next);
  });
  
  // Handle add classification post request
  router.post(
    "/add-classification",
    utilities.checkInventoryAccess, 
    invValidate.classificationRules(),
    invValidate.checkClassificationData,
    utilities.handleErrors(invController.addClassification)
  );
  
  // Route for add inventory page
  router.get("/add-inventory", (req, res, next) => {
    utilities.checkInventoryAccess, utilities.handleErrors(invController.buildAddInventory)(req, res, next);
  });
  
  // Handle add inventory post request
  router.post(
    "/add-inventory",
    utilities.checkInventoryAccess, 
    
    invValidate.inventoryRules(),
    invValidate.checkInventoryData,
    utilities.handleErrors(invController.addInventory)
  );
  
router.post(
  "/update/",
  utilities.checkInventoryAccess, 
  invValidate.newInventoryRules(),
  invValidate.checkUpdateData,
  utilities.handleErrors(invController.updateInventory))


router.get("/getInventory/:classification_id", utilities.checkInventoryAccess, utilities.handleErrors(invController.getInventoryJSON))
module.exports = router; 










