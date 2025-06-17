const invModel = require("../models/inventory-model");
const utilities = require("../utilities");

const invCont = {};

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  })
}


/* ***************************
 *  Build vehicle detail view
 * ************************** */
invCont.buildById = async function (req, res, next) {
  // get inventory id from params
  const inventory_id = req.params.inv_id;

  // get specific vehicle data
  const vehicleDetails = await invModel.getInventoryById(inventory_id);

  // in case vehicle isn't found
  if (!vehicleDetails) {
    return res.status(404).send("Vehicle not found");
  }

  const nav = await utilities.getNav();
  const detailView = await utilities.buildDetailView(vehicleDetails);

  // render detail view
  res.render("./inventory/detail", {
    title: vehicleDetails.inv_year + " " + vehicleDetails.inv_make + " " + vehicleDetails.inv_model,
    nav,
    detailView,
  });
};

/* ***************************
 *  Update inventory item
 * ************************** */
invCont.updateInventory = async function (req, res) {
  let nav = await utilities.getNav();
  
  const {
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,    
    inv_miles,
    inv_color,
    classification_id,
  } = req.body;

  const updateResult = await invModel.updateInventory(
    inv_id,
    inv_make,
    inv_model,   
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id
  );

  if (updateResult) {
    const itemName = updateResult.inv_make + " " + updateResult.inv_model
    req.flash("notice", `The ${itemName} was successfully updated.`)
    res.redirect("/inv/")
  } else {
    const classificationSelect = await utilities.buildClassificationList(classification_id)
    const itemName = `${inv_make} ${inv_model}`
    req.flash("notice", "Sorry, the insert failed.")
    res.status(501).render("inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationSelect: classificationSelect,
    errors: null,
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id
    })
  }
}

/* ***************************
 *  Build inv management view
 * ************************** */
invCont.buildManageInventory = async function (req, res, next) {
  let nav = await utilities.getNav();
  const classificationSelect = await utilities.buildClassificationList();
  res.render("./inventory/management", {
    title: "Manage Inventory",
    nav,
    errors: null,
    classificationSelect
  });
};

/* ***************************
 *  Build add classification view
 * ************************** */
invCont.buildAddClassification = async function (req, res, next) {
  let nav = await utilities.getNav();
  res.render("./inventory/add-classification", {
    title: "Add Classification",
    nav,
    errors: null,
  });
};

/* ***************************
 *  Process adding new classification
 * ************************** */
invCont.addClassification = async function (req, res) {
  let nav = await utilities.getNav();
  const { classification_name } = req.body;

  const addClassificationResult = await invModel.addClassification(
    classification_name
  );

  if (addClassificationResult) {
    req.flash(
      "notice",
      `New Classification ${classification_name} added successfully.`
    );
    res.status(201).render("inventory/management", {
      title: "Manage Inventory",
      nav,
      errors: null,
    });
  } else {
    req.flash(
      "error",
      `Sorry, there was an error adding the ${classification_name} as a new class.`
    );
    res.status(501).render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      errors: null,
    });
  }
};

/* ***************************
 *  Build add inventory view
 * ************************** */
invCont.buildAddInventory = async function (req, res, next) {
  let nav = await utilities.getNav();
  let dropdown = await utilities.buildDropdown();
  res.render("./inventory/add-inventory", {
    title: "Add Inventory",
    nav,
    dropdown,
    errors: null,
  });
};

/* ***************************
 *  Process adding new inventory item
 * ************************** */
invCont.addInventory = async function (req, res) {
  let nav = await utilities.getNav();
  let dropdown = await utilities.buildDropdown();

  const {
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
    classification_id,
  } = req.body;

  const addInventoryResult = await invModel.addInventory(
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
    classification_id
  );

  if (addInventoryResult) {
    req.flash(
      "notice",
      `${inv_make} ${inv_model} added to inventory successfully.`
    );
    res.status(201).render("inventory/management", {
      title: "Manage Inventory",
      nav,
      errors: null,
    });
  } else {
    req.flash(
      "error",
      `Sorry, there was an error adding the ${inv_make} ${inv_model} to the inventory.`
    );
    res.status(501).render("inventory/add-inventory", {
      title: "Add Inventory",
      nav,
      dropdown,
      errors: null,
    });
  }
};



/* ***************************
 *  Build error view
 * ************************** */
invCont.buildError = async function (req, res, next) {
  const error = new Error("Server Error");
  error.status = 500;
  throw error;
};

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await invModel.getInventoryByClassificationId(classification_id)
  if (invData[0].inv_id) {
    return res.json(invData)
  } else {
    next(new Error("No data returned"))
  }
}

/* ***************************
 *  Build edit inventory view
 * ************************** */

invCont.buildEditInventory = async function(req, res, next) {
  try {
    const inv_id = parseInt(req.params.inv_id);
    if (isNaN(inv_id)) throw new Error("Invalid inventory ID");
    
    const itemData = await invModel.getInventoryById(inv_id);
    if (!itemData) throw new Error("Inventory not found");

    const nav = await utilities.getNav();
    const classificationSelect = await utilities.buildClassificationList(itemData.classification_id);
    
    res.render("inventory/edit-inventory", {
      title: `Edit ${itemData.inv_make} ${itemData.inv_model}`,
      nav,
      classificationSelect,
      errors: null,
      ...itemData
    });
  } catch (error) {
    req.flash("notice", error.message);
    res.redirect("/inv/");
  }
}

module.exports = invCont






